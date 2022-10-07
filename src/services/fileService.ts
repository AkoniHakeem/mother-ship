import { DeleteResult, EntityManager, UpdateResult } from 'typeorm';
// import { AddFileDto } from '../controllers/fileController/DT0/DTO';
import { File } from '../entities/File';
import { generateTimeStampedUId } from './cryptoServices';
import { db } from './databaseServie';
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  S3ClientConfig,
  PutObjectCommand,
  CompleteMultipartUploadCommand,
  CompletedPart,
  CompleteMultipartUploadCommandOutput,
  AbortMultipartUploadCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  ObjectIdentifier,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ContentTypes, FileUploadContentTypes, FileUploadExtensions } from '../lib/enums/contentTypes.enum';
import cuid from 'cuid';
import { FilePurpose } from '../lib/enums/filePurpose.enum';
import {
  AWS_ACCESS_KEY_ID,
  AWS_S3_BUCKET_REGION,
  AWS_SECRET_ACCESS_KEY,
  AWS_SIGNED_URL_EXPIRY,
  FILE_CHUNK_PARTITION_SIZE,
  S3_BUCKET_NAME,
} from '../lib/projectConstants';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PreSignedUrlPart } from '../lib/types';
import { isString, orderBy, get } from 'lodash';
import { Logger } from '../logger/logger';
import internal from 'stream';

const deleteFilesUsingUniqueKeys = async function (fileUniqueKeys: string[]): Promise<boolean> {
  const objectsToDelete: ObjectIdentifier[] = fileUniqueKeys.map((Key) => ({ Key }));
  const deleteFilesCommand = new DeleteObjectsCommand({
    Bucket: S3_BUCKET_NAME,
    Delete: {
      Objects: objectsToDelete,
    },
  });

  const deleteCommandResponse = await FileService.getNewS3Client().send(deleteFilesCommand);
  if ([200, 204].includes(get(deleteCommandResponse, '$metadata.httpStatusCode'))) {
    return true;
  } else {
    /* log delete response */
    Logger.info(JSON.stringify(deleteCommandResponse));
    return false;
  }
};

export class FileService {
  static async saveFile(file: File): Promise<File> {
    return await db().save(File, file);
  }

  static async deleteFile(fileId: string): Promise<DeleteResult> {
    return await db().delete(File, fileId);
  }

  static async softDelete(fileId: string): Promise<UpdateResult> {
    return await db().softDelete(File, fileId);
  }

  static async removeFile(deleteCondition: Record<string, string | number | unknown>): Promise<DeleteResult> {
    return await db().delete(File, deleteCondition);
  }

  static async getFileInfos(condition: Record<string, string | number | unknown>): Promise<File[]> {
    return await db().find(File, condition);
  }

  static async getFile(fileId: string): Promise<File | undefined> {
    return (
      (await db().findOne(File, {
        where: {
          id: fileId,
        },
      })) || undefined
    );
  }

  static async getFiles(fileIds: string[]): Promise<File[] | undefined> {
    if (!fileIds.length) {
      return undefined;
    }

    return await db()
      .createQueryBuilder()
      .select('file')
      .from(File, 'file')
      .where('file.id in (:...fileIds)', {
        fileIds,
      })
      .getMany();
  }

  static async updateFile(
    fileId: string,
    fieldsToUpdate: QueryDeepPartialEntity<File>,
    entityManager?: EntityManager,
  ): Promise<void> {
    if (entityManager) {
      await entityManager.createQueryBuilder().update(File).set(fieldsToUpdate).where({ id: fileId }).execute();
    } else {
      await db().createQueryBuilder().update(File).set(fieldsToUpdate).where({ id: fileId }).execute();
    }
  }

  static getFileContentType(contentType: FileUploadContentTypes): ContentTypes {
    switch (contentType) {
      case FileUploadContentTypes.WORD_DOC:
        return ContentTypes.WORD_DOC;
      case FileUploadContentTypes.WORD_DOCX:
        return ContentTypes.WORD_DOCX;
      default:
        return ContentTypes.PDF;
    }
  }

  static getFileContentTypeFromExtension(extension: FileUploadExtensions): ContentTypes {
    switch (extension) {
      case FileUploadExtensions.WORD_DOC:
        return ContentTypes.WORD_DOC;
      case FileUploadExtensions.WORD_DOCX:
        return ContentTypes.WORD_DOCX;
      default:
        return ContentTypes.PDF;
    }
  }

  static getFilePathUniqueKeyName(filePurpose: FilePurpose, fileExtension: string, uniqueKey?: string): string {
    uniqueKey = uniqueKey ? uniqueKey : cuid();
    uniqueKey = `${uniqueKey}.${Date.now()}`;
    const filePath = `${filePurpose}/${uniqueKey}.${fileExtension}`;

    return filePath;
  }

  static getFilePartsCount(fileSize: number, divisionSize: number): number {
    const division = fileSize / divisionSize;
    const partsCount = Math.ceil(division);
    return partsCount;
  }

  static async generateRandomUidForFile(): Promise<string> {
    let randomUid;
    let uIdInDb;
    const randomNumLength = 3;
    do {
      /* repeat while uId exists in database  */
      randomUid = generateTimeStampedUId(randomNumLength);
      uIdInDb = await db().findOne(File, { where: { fileUniqueKey: randomUid } });
    } while (uIdInDb);

    return randomUid;
  }

  static getNewS3Client(): S3Client {
    const s3ClientConfiguration: S3ClientConfig = {
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
        // sessionToken: sessionToken,
      },
      region: AWS_S3_BUCKET_REGION,
    };
    const s3Client = new S3Client(s3ClientConfiguration);
    return s3Client;
  }

  static async initiateMultipartUploadProcess(
    fileUniqueKey: string,
    contentType: ContentTypes,
  ): Promise<string | undefined> {
    try {
      const createMultipartUploadCommand = new CreateMultipartUploadCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileUniqueKey,
        ContentType: contentType,
      });

      const s3Client = FileService.getNewS3Client();

      const commandResponse = await s3Client.send(createMultipartUploadCommand);
      return commandResponse.UploadId;
    } catch (error) {
      throw error;
    }
  }

  static getCommand<T>(command: { new (...args: unknown[]): T }, configuration: Record<string, unknown>): T {
    return new command(configuration);
  }

  static async generateMultipartSignedUrls(
    fileUploadId: string,
    fileUniqueKey: string,
    fileSizeBytes: number,
  ): Promise<PreSignedUrlPart[]> {
    // const multipartUploadParams =

    try {
      const uploadPartCommad = new UploadPartCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileUniqueKey,
        UploadId: fileUploadId,
        ContentLength: 0,
        /* part number is updated when signing program starts */
        PartNumber: 0,
      });

      const preSignedUrlParts: PreSignedUrlPart[] = [];

      /* this has a unit in mb */
      const fileChunckPartitionSize = FILE_CHUNK_PARTITION_SIZE;
      /* it is important to run these two functions together so we are sure that the parts referenced are equal */
      const s3Client = FileService.getNewS3Client();

      let partsProcessed = 0;
      let bytesProcessed = 0;

      while (bytesProcessed < fileSizeBytes) {
        const isLastChunk = fileSizeBytes - bytesProcessed <= fileChunckPartitionSize;
        const chunkSize = isLastChunk ? fileSizeBytes - bytesProcessed : fileChunckPartitionSize;
        uploadPartCommad.input.PartNumber = partsProcessed + 1;
        uploadPartCommad.input.ContentLength = chunkSize;

        const signedUrlExpiry = Number(process.env.AWS_SIGNED_URL_EXPIRY);
        const preSignedUrl = await getSignedUrl(s3Client, uploadPartCommad, { expiresIn: signedUrlExpiry });

        /* from is current - previous + 1 : from the second iterations */
        const from = bytesProcessed;

        /* to is current */
        const to = isLastChunk ? fileSizeBytes + 1 : bytesProcessed + fileChunckPartitionSize;

        preSignedUrlParts.push({
          preSignedUrl,
          partNumber: partsProcessed + 1,
          bytesFrom: from,
          bytesTo: to,
        });

        partsProcessed++;
        bytesProcessed += chunkSize;
      }

      return preSignedUrlParts;
    } catch (error) {
      throw error;
    }
  }

  static async generateSingleFileSignedUrlForPutObject(
    fileUniqueKey: string,
    contentType: ContentTypes,
    fileSizeBytes: number,
  ): Promise<string> {
    try {
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileUniqueKey,
        ContentType: contentType,
        /* todo: check if frontend can correctly define the content lenght to use in signing the request. */
        ContentLength: fileSizeBytes,
      });

      const s3Client = FileService.getNewS3Client();

      const signedUrlExpiry = Number(process.env.AWS_SIGNED_URL_EXPIRY);
      const preSignedUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: signedUrlExpiry });
      return preSignedUrl;
    } catch (error) {
      throw error;
    }
  }

  static async completeUpload(
    fileUniqueKey: string,
    uploadId: string,
    completedParts: CompletedPart[],
  ): Promise<CompleteMultipartUploadCommandOutput> {
    const s3Client = FileService.getNewS3Client();

    const completeUploadCommand = new CompleteMultipartUploadCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileUniqueKey,
      UploadId: uploadId,
      MultipartUpload: { Parts: orderBy(completedParts, ['PartNumber'], ['asc']) },
    });

    const response = await s3Client.send(completeUploadCommand);

    return response;
  }

  static async abortUpload(
    fileUniqueKey: string,
    uploadId: string | null,
  ): Promise<CompleteMultipartUploadCommandOutput | void> {
    if (isString(uploadId)) {
      const s3Client = FileService.getNewS3Client();

      const abortUploadCommand = new AbortMultipartUploadCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileUniqueKey,
        UploadId: uploadId,
      });

      const response = await s3Client.send(abortUploadCommand);

      return response;
    }
  }

  static async generatePreSignedUrlForFile(fileUniqueKey: string, expiresIn = 0): Promise<string> {
    const getCommand = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileUniqueKey,
    });

    const s3Client = FileService.getNewS3Client();

    const preSignedUrlForFileGet = await getSignedUrl(s3Client, getCommand, {
      expiresIn: expiresIn || AWS_SIGNED_URL_EXPIRY,
    });

    return preSignedUrlForFileGet;
  }

  static async deleteFilesUsingIds(
    fileIds: string[],
    manager: EntityManager = db(),
    forceRemove = false,
  ): Promise<boolean> {
    const result = (await manager
      .createQueryBuilder()
      .select('file.fileUniqueKey', 'key')
      .addSelect('file.id', 'id')
      .addSelect(
        `(select count("subFile"."id") as "cnt" from "file" as "subFile" where "subFile"."fileUniqueKey" = "file"."fileUniqueKey" limit 1)`,
        'total',
      )
      .from(File, 'file')
      .where('file.id in (:...fileIds)', {
        fileIds,
      })
      .getRawMany()) as {
      key: string;
      id: string;
      total: string;
    }[];

    if (result && result.length) {
      const keys = result
        .map((file) => (parseInt(file.total, 10) === 1 ? file.key : forceRemove))
        .filter((key) => !!key) as string[];

      let canContinue = true;
      if (keys.length > 0) {
        canContinue = await deleteFilesUsingUniqueKeys(keys);
      }

      if (canContinue) {
        const fileIds = result.map((file) => file.id);
        await manager
          .createQueryBuilder()
          .delete()
          .from(File)
          .where('id in (:...fileIds)', {
            fileIds,
          })
          .execute();
      }

      return true;
    }

    return false;
  }

  static async deleteFilesUsingUniqueKeys(
    uniqueKeys: string[],
    manager: EntityManager = db(),
    forceRemove = false,
  ): Promise<boolean> {
    const result = (await manager
      .createQueryBuilder()
      .select('file.fileUniqueKey', 'key')
      .addSelect('file.id', 'id')
      .addSelect(
        `(select count("subFile"."id") as "cnt" from "file" as "subFile" where "subFile"."fileUniqueKey" = "file"."fileUniqueKey" limit 1)`,
        'total',
      )
      .from(File, 'file')
      .where('file.fileUniqueKey in (:...uniqueKeys)', {
        uniqueKeys,
      })
      .getRawMany()) as {
      key: string;
      id: string;
      total: string;
    }[];

    if (result && result.length) {
      const keys = result
        .map((file) => (parseInt(file.total, 10) === 1 ? file.key : forceRemove))
        .filter((key) => !!key) as string[];

      let canContinue = true;
      if (keys.length > 0) {
        canContinue = await deleteFilesUsingUniqueKeys(keys);
      }

      if (canContinue) {
        const fileIds = result.map((file) => file.id);
        await manager
          .createQueryBuilder()
          .delete()
          .from(File)
          .where('id in (:...fileIds)', {
            fileIds,
          })
          .execute();
      }

      return true;
    }

    return false;
  }

  static async uploadToAws(
    fileKey: string,
    body: string | internal.Readable | ReadableStream | Blob | Uint8Array | Buffer | undefined,
    contentType: string,
  ): Promise<PutObjectCommandOutput> {
    const s3Client = FileService.getNewS3Client();

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileKey,
      Body: body,
      ContentType: contentType,
    });

    const response = await s3Client.send(putObjectCommand);
    return response;
  }
}

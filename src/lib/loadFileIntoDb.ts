/* get idea about excdl parser and type orm seeder */
import { Row, Workbook } from 'exceljs';

export type readXlsxParam = {
  pathToFile: string;
  sheetNameToReadFrom: string;
  rowStart: number;
  rowsCount: number;
};

export const readXlsxRows = async (params: readXlsxParam): Promise<Row[] | undefined> => {
  const excelWorkBook = new Workbook();
  const excelFile = await excelWorkBook.xlsx.readFile(params.pathToFile);
  const sheet = excelFile.getWorksheet(params.sheetNameToReadFrom);

  const rowsInSheet = sheet.getRows(params.rowStart, params.rowsCount);
  return rowsInSheet;
};


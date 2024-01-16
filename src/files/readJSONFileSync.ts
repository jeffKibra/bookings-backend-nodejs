import { readFileSync } from 'fs';
import { join } from 'path';

export default function readJSONFileSync(fileName: string) {
  const buffer = readFileSync(join(__dirname, fileName));
  // console.log({ buffer });

  const dataString = buffer.toString();
  // console.log(dataString);
  const fileData = JSON.parse(dataString);
  // console.log(fileData);

  return fileData;
}

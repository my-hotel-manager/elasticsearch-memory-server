import { promisify } from 'util';
import fs from 'fs';

export const locationExists = async (loc: string) => {
  try {
    await promisify(fs.lstat)(loc);
    return true;
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    return false;
  }
};

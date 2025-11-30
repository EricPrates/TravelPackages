import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default{
    dialect: 'sqlite',
    storage: process.env.DB_PATH || path.join(__dirname, '../../db/travel_packages.db'),
    logging: false
}
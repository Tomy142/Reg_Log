import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb)=>{
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() *1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const musicFileFilter = (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos MP3 O WAV'), false);
    }
};

const profileFileFilter = (req, file,cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)){
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos JPG, PNG o JPEG'), false);
    }
};

const uploadMusic = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024},
    fileFilter: musicFileFilter
});

const uploadProfile = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024},
    fileFilter: profileFileFilter
});


export { uploadMusic, uploadProfile};
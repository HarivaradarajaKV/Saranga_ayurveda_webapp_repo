import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const directory = 'c:/Saranga_ayurveda_application_updates/Production_folder_final/02/cosmetics_app/my-app/webapp/public/images/Our Story images';

const files = [
  '1 Handpicked_US.png',
  '2 Naturally Dried_US.png',
  '3 Quality Assured_US.png',
  '4 Expertly Processed_US.png',
  '5 Delivered to you_US.png',
  'OS_01_Sourced_US.png',
  'OS_02_Rooted in Nature_US.png',
  'OS_Last_Our Promise_US.png'
];

async function convert() {
  console.log('Starting image conversion to WebP...');
  for (const file of files) {
    const inputPath = path.join(directory, file);
    const outputPath = path.join(directory, file.replace('.png', '.webp'));
    
    if (fs.existsSync(inputPath)) {
      console.log(`Converting ${file}...`);
      const info = await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Saved ${file.replace('.png', '.webp')} (${(info.size / 1024).toFixed(1)} KB)`);
    } else {
      console.warn(`File not found: ${file}`);
    }
  }
  console.log('Conversion finished!');
}

convert().catch(console.error);

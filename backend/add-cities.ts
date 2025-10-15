import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCities() {
  console.log('Adding cities to database...');

  const cities = await prisma.city.createMany({
    data: [
      // Western Province
      { name: 'Colombo', latitude: 6.9271, longitude: 79.8612 },
      { name: 'Gampaha', latitude: 7.0873, longitude: 79.9990 },
      { name: 'Kalutara', latitude: 6.5854, longitude: 79.9607 },
      { name: 'Negombo', latitude: 7.2008, longitude: 79.8736 },

      // Central Province
      { name: 'Kandy', latitude: 7.2906, longitude: 80.6337 },
      { name: 'Matale', latitude: 7.4675, longitude: 80.6234 },
      { name: 'Nuwara Eliya', latitude: 6.9497, longitude: 80.7891 },

      // Southern Province
      { name: 'Galle', latitude: 6.0535, longitude: 80.2210 },
      { name: 'Matara', latitude: 5.9549, longitude: 80.5550 },
      { name: 'Hambantota', latitude: 6.1429, longitude: 81.1212 },

      // Northern Province
      { name: 'Jaffna', latitude: 9.6615, longitude: 80.0255 },
      { name: 'Kilinochchi', latitude: 9.3961, longitude: 80.4038 },
      { name: 'Mannar', latitude: 8.9810, longitude: 79.9044 },

      // Eastern Province
      { name: 'Trincomalee', latitude: 8.5874, longitude: 81.2152 },
      { name: 'Batticaloa', latitude: 7.7170, longitude: 81.7000 },
      { name: 'Ampara', latitude: 7.2976, longitude: 81.6724 },

      // North Western Province
      { name: 'Kurunegala', latitude: 7.4867, longitude: 80.3647 },
      { name: 'Puttalam', latitude: 8.0362, longitude: 79.8283 },

      // North Central Province
      { name: 'Anuradhapura', latitude: 8.3114, longitude: 80.4037 },
      { name: 'Polonnaruwa', latitude: 7.9403, longitude: 81.0188 },

      // Uva Province
      { name: 'Badulla', latitude: 6.9934, longitude: 81.0550 },
      { name: 'Monaragala', latitude: 6.8728, longitude: 81.3507 },

      // Sabaragamuwa Province
      { name: 'Ratnapura', latitude: 6.6828, longitude: 80.3992 },
      { name: 'Kegalle', latitude: 7.2513, longitude: 80.3464 },
    ],
    skipDuplicates: true, // Skip if city already exists
  });

  console.log(`✅ Successfully added ${cities.count} cities to the database!`);
  console.log('\nYou can now test the API:');
  console.log('  GET http://localhost:3000/cities');
  console.log('  GET http://localhost:3000/cities/1');
}

addCities()
  .catch((error) => {
    console.error('❌ Error adding cities:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

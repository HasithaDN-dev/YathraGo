// Direct database query to check driver data
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDriverData() {
  console.log('Checking driver data in database...\n');

  // Get all active drivers
  const drivers = await prisma.driver.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      driverCities: true,
      vehicles: true,
    },
  });

  console.log(`Total ACTIVE drivers: ${drivers.length}\n`);

  for (const driver of drivers) {
    console.log(`Driver ID: ${driver.driver_id}`);
    console.log(`Name: ${driver.name}`);
    console.log(`Status: ${driver.status}`);
    console.log(`Registration Status: ${driver.registrationStatus}`);
    console.log(`DriverCities entries: ${driver.driverCities.length}`);
    console.log(`Vehicles: ${driver.vehicles.length}`);
    
    if (driver.driverCities.length > 0) {
      const dc = driver.driverCities[0];
      console.log(`  - RideType: ${dc.rideType}`);
      console.log(`  - CityIds: ${dc.cityIds?.length || 0} cities`);
    }
    
    console.log('---\n');
  }

  // Check drivers with HAVING_A_PROFILE status
  const profileDrivers = await prisma.driver.findMany({
    where: {
      status: 'ACTIVE',
      registrationStatus: 'HAVING_A_PROFILE',
    },
  });

  console.log(`\nDrivers with ACTIVE + HAVING_A_PROFILE: ${profileDrivers.length}`);
  console.log(`Their IDs: ${profileDrivers.map(d => d.driver_id).join(', ')}`);

  await prisma.$disconnect();
}

checkDriverData().catch(console.error);

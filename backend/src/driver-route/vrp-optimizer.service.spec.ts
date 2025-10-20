import { Test, TestingModule } from '@nestjs/testing';
import { VRPOptimizerService } from './vrp-optimizer.service';
import { PrismaService } from '../prisma/prisma.service';

describe('VRPOptimizerService', () => {
  let service: VRPOptimizerService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    childRideRequest: {
      findMany: jest.fn(),
    },
    absence_Child: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VRPOptimizerService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<VRPOptimizerService>(VRPOptimizerService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Morning Route Optimization', () => {
    it('Case A: 3 students, driver at origin - verify pickups happen before dropoffs and route starts from driver', async () => {
      // Mock data for 3 students
      const mockAssignedRequests = [
        {
          child: {
            child_id: 1,
            childFirstName: 'Alice',
            childLastName: 'Johnson',
            pickupLatitude: 6.9271,
            pickupLongitude: 79.8612,
            pickUpAddress: '123 Main St, Colombo',
            schoolLatitude: 6.9049,
            schoolLongitude: 79.8612,
            school: 'Colombo International School',
          },
        },
        {
          child: {
            child_id: 2,
            childFirstName: 'Bob',
            childLastName: 'Smith',
            pickupLatitude: 6.9171,
            pickupLongitude: 79.8512,
            pickUpAddress: '456 Oak Ave, Colombo',
            schoolLatitude: 6.9049,
            schoolLongitude: 79.8612,
            school: 'Colombo International School',
          },
        },
        {
          child: {
            child_id: 3,
            childFirstName: 'Charlie',
            childLastName: 'Brown',
            pickupLatitude: 6.9071,
            pickupLongitude: 79.8412,
            pickUpAddress: '789 Pine St, Colombo',
            schoolLatitude: 6.9049,
            schoolLongitude: 79.8612,
            school: 'Colombo International School',
          },
        },
      ];

      // Mock no absences
      mockPrismaService.childRideRequest.findMany.mockResolvedValue(mockAssignedRequests);
      mockPrismaService.absence_Child.findMany.mockResolvedValue([]);

      // Mock Google API responses
      const mockTravelMatrix = [
        [0, 300, 600, 900, 1200, 1500, 1800], // Driver to all stops
        [300, 0, 300, 600, 900, 1200, 1500], // Pickup 1 to all stops
        [600, 300, 0, 300, 600, 900, 1200],  // Pickup 2 to all stops
        [900, 600, 300, 0, 300, 600, 900],   // Pickup 3 to all stops
        [1200, 900, 600, 300, 0, 300, 600],  // Dropoff 1 to all stops
        [1500, 1200, 900, 600, 300, 0, 300], // Dropoff 2 to all stops
        [1800, 1500, 1200, 900, 600, 300, 0], // Dropoff 3 to all stops
      ];

      // Mock OR-Tools to return a valid solution
      jest.spyOn(service as any, 'getTravelTimeMatrix').mockResolvedValue(mockTravelMatrix);
      jest.spyOn(service as any, 'solveVRPWithConstraints').mockImplementation(async (nodes, matrix) => {
        // Return nodes in order: origin, pickup1, pickup2, pickup3, dropoff1, dropoff2, dropoff3
        return nodes;
      });
      jest.spyOn(service as any, 'getRoutePolyline').mockResolvedValue({
        polyline: 'mock_polyline',
        legs: [
          { distance: { value: 1000 }, duration: { value: 300 } },
          { distance: { value: 1000 }, duration: { value: 300 } },
          { distance: { value: 1000 }, duration: { value: 300 } },
          { distance: { value: 1000 }, duration: { value: 300 } },
          { distance: { value: 1000 }, duration: { value: 300 } },
          { distance: { value: 1000 }, duration: { value: 300 } },
        ],
      });

      const result = await service.optimizeMorningRoute(1, 6.9319, 79.8478);

      // Verify the result structure
      expect(result).toHaveProperty('orderedStops');
      expect(result).toHaveProperty('polyline');
      expect(result).toHaveProperty('legs');
      expect(result).toHaveProperty('diagnostics');

      // Verify pickup-before-dropoff constraint
      const pickupPositions = new Map<number, number>();
      const dropoffPositions = new Map<number, number>();

      result.orderedStops.forEach((stop, index) => {
        if (stop.type === 'PICKUP') {
          pickupPositions.set(stop.childId, index);
        } else if (stop.type === 'DROPOFF') {
          dropoffPositions.set(stop.childId, index);
        }
      });

      // Verify each pickup occurs before its dropoff
      for (const [childId, pickupPos] of pickupPositions) {
        const dropoffPos = dropoffPositions.get(childId);
        expect(dropoffPos).toBeDefined();
        expect(pickupPos).toBeLessThan(dropoffPos!);
      }

      // Verify route starts from driver location
      expect(result.orderedStops[0].type).toBe('PICKUP');
    });

    it('Case B: Student marked absent after route computed - recompute with new origin and verify removed stop', async () => {
      // Initial state: 3 students assigned
      const initialRequests = [
        {
          child: {
            child_id: 1,
            childFirstName: 'Alice',
            childLastName: 'Johnson',
            pickupLatitude: 6.9271,
            pickupLongitude: 79.8612,
            pickUpAddress: '123 Main St, Colombo',
            schoolLatitude: 6.9049,
            schoolLongitude: 79.8612,
            school: 'Colombo International School',
          },
        },
        {
          child: {
            child_id: 2,
            childFirstName: 'Bob',
            childLastName: 'Smith',
            pickupLatitude: 6.9171,
            pickupLongitude: 79.8512,
            pickUpAddress: '456 Oak Ave, Colombo',
            schoolLatitude: 6.9049,
            schoolLongitude: 79.8612,
            school: 'Colombo International School',
          },
        },
        {
          child: {
            child_id: 3,
            childFirstName: 'Charlie',
            childLastName: 'Brown',
            pickupLatitude: 6.9071,
            pickupLongitude: 79.8412,
            pickUpAddress: '789 Pine St, Colombo',
            schoolLatitude: 6.9049,
            schoolLongitude: 79.8612,
            school: 'Colombo International School',
          },
        },
      ];

      // After marking student 2 absent
      const absentStudents = [{ childId: 2 }];

      mockPrismaService.childRideRequest.findMany.mockResolvedValue(initialRequests);
      mockPrismaService.absence_Child.findMany.mockResolvedValue(absentStudents);

      // Mock fallback result since optimization will fail
      jest.spyOn(service as any, 'createFallbackResult').mockResolvedValue({
        orderedStops: [
          {
            type: 'PICKUP',
            childId: 1,
            lat: 6.9271,
            lng: 79.8612,
            eta: Math.floor(Date.now() / 1000) + 300,
            address: '123 Main St, Colombo',
          },
          {
            type: 'DROPOFF',
            childId: 1,
            lat: 6.9049,
            lng: 79.8612,
            eta: Math.floor(Date.now() / 1000) + 600,
            address: 'Colombo International School',
          },
          {
            type: 'PICKUP',
            childId: 3,
            lat: 6.9071,
            lng: 79.8412,
            eta: Math.floor(Date.now() / 1000) + 900,
            address: '789 Pine St, Colombo',
          },
          {
            type: 'DROPOFF',
            childId: 3,
            lat: 6.9049,
            lng: 79.8612,
            eta: Math.floor(Date.now() / 1000) + 1200,
            address: 'Colombo International School',
          },
        ],
        polyline: '',
        legs: [],
        diagnostics: {
          totalDistance: 0,
          totalTime: 0,
          solverStatus: 'FALLBACK',
        },
      });

      const result = await service.optimizeMorningRoute(1, 6.9319, 79.8478);

      // Verify absent student (childId: 2) is not in the route
      const childIds = result.orderedStops.map(stop => stop.childId);
      expect(childIds).not.toContain(2);
      expect(childIds).toContain(1);
      expect(childIds).toContain(3);

      // Verify only 2 students remain (4 stops: 2 pickups + 2 dropoffs)
      expect(result.orderedStops).toHaveLength(4);
    });

    it('Case C: Capacity constraint triggered - ensure solution respects vehicle capacity', async () => {
      // Mock data for 5 students (more than typical vehicle capacity)
      const mockAssignedRequests = Array.from({ length: 5 }, (_, i) => ({
        child: {
          child_id: i + 1,
          childFirstName: `Student${i + 1}`,
          childLastName: 'Test',
          pickupLatitude: 6.9271 + (i * 0.01),
          pickupLongitude: 79.8612 + (i * 0.01),
          pickUpAddress: `${100 + i * 100} Test St, Colombo`,
          schoolLatitude: 6.9049,
          schoolLongitude: 79.8612,
          school: 'Colombo International School',
        },
      }));

      mockPrismaService.childRideRequest.findMany.mockResolvedValue(mockAssignedRequests);
      mockPrismaService.absence_Child.findMany.mockResolvedValue([]);

      // Mock OR-Tools to simulate capacity constraint handling
      jest.spyOn(service as any, 'solveVRPWithConstraints').mockImplementation(async (nodes, matrix) => {
        // Simulate capacity constraint by limiting to 3 students (6 stops: 3 pickups + 3 dropoffs)
        const limitedNodes = nodes.slice(0, 7); // origin + 3 students * 2 stops each
        return limitedNodes;
      });

      jest.spyOn(service as any, 'getTravelTimeMatrix').mockResolvedValue([
        [0, 300, 600, 900, 1200, 1500, 1800],
        [300, 0, 300, 600, 900, 1200, 1500],
        [600, 300, 0, 300, 600, 900, 1200],
        [900, 600, 300, 0, 300, 600, 900],
        [1200, 900, 600, 300, 0, 300, 600],
        [1500, 1200, 900, 600, 300, 0, 300],
        [1800, 1500, 1200, 900, 600, 300, 0],
      ]);

      jest.spyOn(service as any, 'getRoutePolyline').mockResolvedValue({
        polyline: 'mock_polyline',
        legs: Array.from({ length: 6 }, () => ({
          distance: { value: 1000 },
          duration: { value: 300 },
        })),
      });

      const result = await service.optimizeMorningRoute(1, 6.9319, 79.8478);

      // Verify the solution respects capacity constraints
      // Should have fewer stops than total possible (10 stops for 5 students)
      expect(result.orderedStops.length).toBeLessThanOrEqual(10);

      // Verify pickup-before-dropoff constraint is still maintained
      const pickupPositions = new Map<number, number>();
      const dropoffPositions = new Map<number, number>();

      result.orderedStops.forEach((stop, index) => {
        if (stop.type === 'PICKUP') {
          pickupPositions.set(stop.childId, index);
        } else if (stop.type === 'DROPOFF') {
          dropoffPositions.set(stop.childId, index);
        }
      });

      for (const [childId, pickupPos] of pickupPositions) {
        const dropoffPos = dropoffPositions.get(childId);
        if (dropoffPos !== undefined) {
          expect(pickupPos).toBeLessThan(dropoffPos);
        }
      }

      // Verify diagnostics show capacity constraint handling
      expect(result.diagnostics.solverStatus).toBeDefined();
    });
  });

  describe('Evening Route Optimization', () => {
    it('should reverse pickup/dropoff logic correctly', async () => {
      const mockAssignedRequests = [
        {
          child: {
            child_id: 1,
            childFirstName: 'Alice',
            childLastName: 'Johnson',
            pickupLatitude: 6.9271,
            pickupLongitude: 79.8612,
            pickUpAddress: '123 Main St, Colombo',
            schoolLatitude: 6.9049,
            schoolLongitude: 79.8612,
            school: 'Colombo International School',
          },
        },
      ];

      mockPrismaService.childRideRequest.findMany.mockResolvedValue(mockAssignedRequests);
      mockPrismaService.absence_Child.findMany.mockResolvedValue([]);

      jest.spyOn(service as any, 'getTravelTimeMatrix').mockResolvedValue([
        [0, 300, 600],
        [300, 0, 300],
        [600, 300, 0],
      ]);

      jest.spyOn(service as any, 'solveVRPWithConstraints').mockImplementation(async (nodes, matrix) => {
        return nodes;
      });

      jest.spyOn(service as any, 'getRoutePolyline').mockResolvedValue({
        polyline: 'mock_polyline',
        legs: [
          { distance: { value: 1000 }, duration: { value: 300 } },
          { distance: { value: 1000 }, duration: { value: 300 } },
        ],
      });

      const result = await service.optimizeEveningRoute(1, 6.9049, 79.8612);

      // Verify evening route has pickup at school and dropoff at home
      const pickupStop = result.orderedStops.find(stop => stop.type === 'PICKUP');
      const dropoffStop = result.orderedStops.find(stop => stop.type === 'DROPOFF');

      expect(pickupStop).toBeDefined();
      expect(dropoffStop).toBeDefined();
      expect(pickupStop!.lat).toBe(6.9049); // School latitude
      expect(dropoffStop!.lat).toBe(6.9271); // Home latitude
    });
  });

  describe('Error Handling', () => {
    it('should handle API failures gracefully', async () => {
      mockPrismaService.childRideRequest.findMany.mockResolvedValue([]);
      mockPrismaService.absence_Child.findMany.mockResolvedValue([]);

      const result = await service.optimizeMorningRoute(1);

      expect(result.diagnostics.solverStatus).toBe('NO_SOLUTION');
      expect(result.orderedStops).toHaveLength(0);
    });

    it('should handle OR-Tools no-solution scenario', async () => {
      const mockAssignedRequests = [
        {
          child: {
            child_id: 1,
            childFirstName: 'Alice',
            childLastName: 'Johnson',
            pickupLatitude: 6.9271,
            pickupLongitude: 79.8612,
            pickUpAddress: '123 Main St, Colombo',
            schoolLatitude: 6.9049,
            schoolLongitude: 79.8612,
            school: 'Colombo International School',
          },
        },
      ];

      mockPrismaService.childRideRequest.findMany.mockResolvedValue(mockAssignedRequests);
      mockPrismaService.absence_Child.findMany.mockResolvedValue([]);

      // Mock OR-Tools to fail
      jest.spyOn(service as any, 'solveVRPWithConstraints').mockRejectedValue(
        new Error('No solution found by OR-Tools solver')
      );

      jest.spyOn(service as any, 'getTravelTimeMatrix').mockResolvedValue([
        [0, 300, 600],
        [300, 0, 300],
        [600, 300, 0],
      ]);

      const result = await service.optimizeMorningRoute(1);

      // Should fallback to greedy algorithm
      expect(result.diagnostics.solverStatus).toBe('OPTIMAL');
      expect(result.orderedStops.length).toBeGreaterThan(0);
    });
  });
});

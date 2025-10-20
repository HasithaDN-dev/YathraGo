'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { useError } from '@/hooks/useError';
import { api } from '@/lib/api';
import type { Vehicle } from '@/types/api';
import { CheckCircle, XCircle, Car, FileText, Image as ImageIcon } from 'lucide-react';

export default function ApproveVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; vehicleId: number | null }>({
    open: false,
    vehicleId: null,
  });
  const [rejectReason, setRejectReason] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { error, setError, clearError } = useError();

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const response = await api.driverCoordinator.getPendingVehicles(page, 10);
      
      if (response.success && response.data) {
        setVehicles(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending vehicles');
    } finally {
      setLoading(false);
    }
  }, [page, clearError, setError]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleApprove = async (vehicleId: number) => {
    try {
      setActionLoading(vehicleId);
      clearError();
      setSuccessMessage(null);
      const response = await api.driverCoordinator.approveVehicle(vehicleId);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Vehicle approved successfully');
        // Refresh the list
        await fetchVehicles();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve vehicle');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.vehicleId || !rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(rejectDialog.vehicleId);
      clearError();
      setSuccessMessage(null);
      const response = await api.driverCoordinator.rejectVehicle(
        rejectDialog.vehicleId,
        rejectReason
      );
      
      if (response.success) {
        setSuccessMessage(response.message || 'Vehicle rejected');
        setRejectDialog({ open: false, vehicleId: null });
        setRejectReason('');
        // Refresh the list
        await fetchVehicles();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject vehicle');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectDialog = (vehicleId: number) => {
    setRejectDialog({ open: true, vehicleId });
    setRejectReason('');
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Approve Vehicles</h1>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Approve Vehicles</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve pending vehicle registrations
        </p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={clearError} />}

      {successMessage && (
        <ErrorAlert message={successMessage} type="success" onDismiss={() => setSuccessMessage(null)} />
      )}

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No pending vehicles</p>
            <p className="text-sm text-muted-foreground">All vehicles have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        {vehicle.brand} {vehicle.model}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Vehicle ID: {vehicle.id} • Year: {vehicle.manufactureYear}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Pending Approval</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Vehicle Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-sm font-semibold">{vehicle.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Color</p>
                      <p className="text-sm font-semibold">{vehicle.color}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Seats</p>
                      <p className="text-sm font-semibold">{vehicle.no_of_seats}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">A/C</p>
                      <p className="text-sm font-semibold">
                        {vehicle.air_conditioned ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {/* Owner Information */}
                  {vehicle.VehicleOwner && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold mb-2">Owner Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Name</p>
                          <p className="text-sm font-medium">
                            {vehicle.VehicleOwner.first_name} {vehicle.VehicleOwner.last_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="text-sm font-medium">{vehicle.VehicleOwner.phone}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vehicle Images */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Vehicle Images
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {vehicle.front_picture_url && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Front</p>
                          <Image
                            src={vehicle.front_picture_url}
                            alt="Front"
                            width={200}
                            height={96}
                            className="w-full h-24 object-cover rounded border"
                          />
                        </div>
                      )}
                      {vehicle.rear_picture_url && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Rear</p>
                          <Image
                            src={vehicle.rear_picture_url}
                            alt="Rear"
                            width={200}
                            height={96}
                            className="w-full h-24 object-cover rounded border"
                          />
                        </div>
                      )}
                      {vehicle.side_picture_url && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Side</p>
                          <Image
                            src={vehicle.side_picture_url}
                            alt="Side"
                            width={200}
                            height={96}
                            className="w-full h-24 object-cover rounded border"
                          />
                        </div>
                      )}
                      {vehicle.inside_picture_url && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Inside</p>
                          <Image
                            src={vehicle.inside_picture_url}
                            alt="Inside"
                            width={200}
                            height={96}
                            className="w-full h-24 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {vehicle.revenue_license_url && (
                        <a
                          href={vehicle.revenue_license_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Revenue License
                        </a>
                      )}
                      {vehicle.insurance_front_url && (
                        <a
                          href={vehicle.insurance_front_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Insurance (Front)
                        </a>
                      )}
                      {vehicle.insurance_back_url && (
                        <a
                          href={vehicle.insurance_back_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Insurance (Back)
                        </a>
                      )}
                      {vehicle.vehicle_reg_url && (
                        <a
                          href={vehicle.vehicle_reg_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Vehicle Registration
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleApprove(vehicle.id)}
                      disabled={actionLoading === vehicle.id}
                      className="flex-1"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {actionLoading === vehicle.id ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => openRejectDialog(vehicle.id)}
                      disabled={actionLoading === vehicle.id}
                      className="flex-1"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, vehicleId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Vehicle</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this vehicle registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog({ open: false, vehicleId: null });
                setRejectReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoading !== null}
            >
              {actionLoading ? 'Rejecting...' : 'Reject Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


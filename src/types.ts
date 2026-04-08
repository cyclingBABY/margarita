/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'staff' | 'housekeeping' | 'guest';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: string;
}

export type RoomStatus = 'available' | 'occupied' | 'dirty' | 'maintenance';
export type RoomType = 'single' | 'double' | 'suite' | 'deluxe';

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  status: RoomStatus;
  pricePerNight: number;
  description: string;
  amenities: string[];
  floor: number;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';

export interface Reservation {
  id: string;
  guestId: string;
  guestName: string;
  roomId: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: ReservationStatus;
  createdAt: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Feedback {
  id: string;
  guestId: string;
  guestName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface HotelEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizerId: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

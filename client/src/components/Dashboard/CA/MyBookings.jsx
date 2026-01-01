import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Video, FileText, XCircle, CheckCircle } from 'lucide-react';
import { bookingService } from '../../../services/bookingService';
import Button from '../../Button/Button';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await bookingService.getMyBookings();
                setBookings(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    if (loading) return <div className="p-10 text-center">Loading your bookings...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Bookings</h2>

            {bookings.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-gray-500 mb-4">You haven't booked any consultations yet.</p>
                    <Button variant="outline" onClick={() => window.location.href='/dashboard/ca-services'}>
                        Find a CA
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                    {booking.consultationType.replace('_', ' ').toUpperCase()}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">with {booking.caName}</p>
                                
                                <div className="flex gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(booking.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Clock size={14}/> {booking.timeSlot} ({booking.duration} min)</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1
                                    ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {booking.status === 'confirmed' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                                    {booking.status.toUpperCase()}
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">₹{booking.amount}</span>
                                
                                {booking.status === 'confirmed' && (
                                    <div className="flex gap-2 mt-2">
                                        <a href={booking.meetingLink} target="_blank" rel="noreferrer" 
                                           className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-2">
                                            <Video size={16}/> Join Meeting
                                        </a>
                                        <button className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <FileText size={16}/> Invoice
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookings;

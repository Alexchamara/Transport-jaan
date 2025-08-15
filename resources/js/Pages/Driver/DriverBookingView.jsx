import React, { useState, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const DriverBookingView = () => {
  const { bookings, flash } = usePage().props;
  const [isCommentOpen, setCommentOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);
  const commentsEndRef = useRef(null);

  // Auto-scroll to bottom when comments change
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedBooking?.comments?.length) {
      setTimeout(scrollToBottom, 100);
    }
  }, [selectedBooking?.comments]);

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setCommentText(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      router.delete(route('driver.booking.delete', id));
    }
  };

  const handleAccept = (id) => {
    router.put(route('driver.booking.accept', id));
  };

  const handleComplete = (id) => {
    router.put(route('driver.booking.complete', id), {
      onSuccess: () => alert('Booking marked as completed.'),
      onError: () => alert('Failed to mark booking as completed.'),
    });
  };

  const handleOpenComment = (booking) => {
    setSelectedBooking(booking);
    setCommentText('');
    setCommentOpen(true);
  };

  const handleCloseModal = () => {
    setCommentOpen(false);
    setCommentText('');
    setSelectedBooking(null);
  };

  const handleSubmitComment = async () => {
    if (!selectedBooking || !commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);

    router.post(route('driver.booking.chat'), {
      driver_booking_id: selectedBooking.id,
      comment: commentText.trim(),
    }, {
      onSuccess: () => {
        setCommentText('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
        // Don't close modal, keep it open for continued conversation
      },
      onError: () => {
        alert('Failed to submit comment. Please try again.');
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };

  // Handle Enter key submission (Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const statusColorMap = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    confirmed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Driver Bookings</h1>
        <p className="text-gray-600">Manage your driver booking requests and communicate with clients</p>
      </div>

      {/* Flash Message */}
      {flash.message && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {flash.message}
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Communication</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking, index) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{String(index + 1).padStart(3, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(booking.start_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(booking.end_date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {booking.description || (
                      <span className="text-gray-400 italic">No description</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColorMap[booking.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleAccept(booking.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                      >
                        Accept
                      </button>
                    )}

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleComplete(booking.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                      >
                        Complete
                      </button>
                    )}

                    {booking.status === 'completed' ? (
                      <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-emerald-700">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Trip Done
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleOpenComment(booking)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Chat
                      {booking.comments?.length > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                          {booking.comments.length}
                        </span>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">You don't have any driver bookings yet.</p>
          </div>
        )}
      </div>

      {/* Enhanced Comment Modal */}
      <Transition appear show={isCommentOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4 sm:translate-y-0"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-4 sm:translate-y-0"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Dialog.Title as="h3" className="text-lg font-semibold text-white">
                          Chat & Comments
                        </Dialog.Title>
                        {selectedBooking && (
                          <p className="text-blue-100 text-sm mt-1">
                            Booking #{String(bookings.findIndex(b => b.id === selectedBooking.id) + 1).padStart(3, '0')} • {formatDate(selectedBooking.start_date)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleCloseModal}
                        className="text-blue-100 hover:text-white transition-colors p-1 rounded-full hover:bg-blue-500"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="px-6 py-4">
                    <div className="bg-gray-50 rounded-xl p-4 max-h-80 overflow-y-auto mb-4 border">
                      {selectedBooking?.comments?.length ? (
                        <div className="space-y-3">
                          {selectedBooking.comments.map((comment, index) => (
                            <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 leading-relaxed">{comment.comment}</p>
                                  {comment.created_at && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {formatTime(comment.created_at)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={commentsEndRef} />
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <p className="text-gray-500 text-sm">No messages yet</p>
                          <p className="text-gray-400 text-xs mt-1">Start the conversation below</p>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="space-y-3">
                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          rows={3}
                          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                          value={commentText}
                          onChange={handleTextareaChange}
                          onKeyDown={handleKeyDown}
                          disabled={isSubmitting}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                          {commentText.length}/500
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-between items-center">
                        <button
                          onClick={handleCloseModal}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={handleSubmitComment}
                          disabled={!commentText.trim() || isSubmitting}
                          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              Send Message
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default DriverBookingView;

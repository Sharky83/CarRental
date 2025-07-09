import React, { memo, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { useIntersectionObserver } from '../hooks/index.js';
import { formatCurrency } from '../lib/utils.js';

/**
 * Optimized Car Card Component with lazy loading and memoization
 */
const CarCard = memo(({ 
  car, 
  onBook, 
  onViewDetails, 
  currency = 'GBP',
  className = '',
  variant = 'default' 
}) => {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Memoize formatted price to avoid recalculation
  const formattedPrice = useMemo(() => {
    return formatCurrency(car.pricePerDay, currency);
  }, [car.pricePerDay, currency]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleBooking = useCallback(() => {
    onBook?.(car);
  }, [onBook, car]);

  const handleViewDetails = useCallback(() => {
    onViewDetails?.(car);
  }, [onViewDetails, car]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
  };

  const imageVariants = {
    hidden: { scale: 1.1, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={cardVariants}
      initial="hidden"
      animate={isIntersecting ? "visible" : "hidden"}
      className={`group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${className}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {isIntersecting && (
          <motion.img
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            src={car.images?.[0] || '/placeholder-car.jpg'}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.src = '/placeholder-car.jpg';
            }}
          />
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            car.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {car.isAvailable ? 'Available' : 'Booked'}
          </span>
        </div>

        {/* Category Badge */}
        {car.category && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-black/20 backdrop-blur-sm text-white rounded-full text-xs font-medium">
              {car.category}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
            {car.brand} {car.model}
          </h3>
          {car.year && (
            <p className="text-sm text-gray-500">{car.year}</p>
          )}
        </div>

        {/* Features */}
        {car.features && car.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {car.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {feature}
              </span>
            ))}
            {car.features.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{car.features.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Specs */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-3">
            {car.seats && (
              <div className="flex items-center space-x-1">
                <span>👥</span>
                <span>{car.seats}</span>
              </div>
            )}
            {car.transmission && (
              <div className="flex items-center space-x-1">
                <span>⚙️</span>
                <span className="capitalize">{car.transmission}</span>
              </div>
            )}
            {car.fuelType && (
              <div className="flex items-center space-x-1">
                <span>⛽</span>
                <span className="capitalize">{car.fuelType}</span>
              </div>
            )}
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formattedPrice}
            </p>
            <p className="text-sm text-gray-500">per day</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleViewDetails}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              View Details
            </button>
            {car.isAvailable && (
              <button
                onClick={handleBooking}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

CarCard.displayName = 'CarCard';

export default CarCard;

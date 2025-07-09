import React, { memo } from 'react'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { cn, formatCurrency } from '../lib/utils'

const CarCard = memo(({car, className}) => {
    const currency = import.meta.env.VITE_CURRENCY
    const navigate = useNavigate()

    const handleCardClick = () => {
        navigate(`/car-details/${car._id}`)
        window.scrollTo(0, 0)
    }

    return (
        <div 
            onClick={handleCardClick} 
            className={cn(
                'group rounded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer bg-white',
                className
            )}
        >
            <div className='relative h-48 overflow-hidden'> 
                <LazyLoadImage
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    effect="blur"
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                    placeholderSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE5MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTBlN2ZmIi8+PC9zdmc+"
                />

                {car.isAvailable && (
                    <div className='absolute top-4 left-4 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm'>
                        Available Now
                    </div>
                )}

                <div className='absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg'>
                    <span className='font-semibold'>{formatCurrency(car.pricePerDay, currency)}</span>
                    <span className='text-sm text-white/80'> / day</span>
                </div>
            </div>

            <div className='p-4 sm:p-5'>
                <div className='flex justify-between items-start mb-2'>
                    <div>
                        <h3 className='text-lg font-medium line-clamp-1'>{car.brand} {car.model}</h3>
                        <p className='text-muted-foreground text-sm'>{car.category} • {car.year}</p>
                    </div>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-y-2 text-gray-600'>
                    <CarFeature icon={assets.users_icon} text={`${car.seating_capacity} Seats`} />
                    <CarFeature icon={assets.fuel_icon} text={car.fuel_type} />
                    <CarFeature icon={assets.car_icon} text={car.transmission} />
                    <CarFeature icon={assets.location_icon} text={car.location} />
                </div>
            </div>
        </div>
    )
})

const CarFeature = memo(({ icon, text }) => (
    <div className='flex items-center text-sm text-muted-foreground'>
        <img src={icon} alt="" className='h-4 w-4 mr-2 flex-shrink-0' loading="lazy" />
        <span className='line-clamp-1'>{text}</span>
    </div>
))

CarCard.displayName = 'CarCard'
CarFeature.displayName = 'CarFeature'

export default CarCard

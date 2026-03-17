import React, { useState } from 'react'

const modeOptions = ['Land', 'Sea', 'Air']
const servicesWithModeOptions = ['Vehicle Rental', 'Ticket Booking']

const baseButtonClass =
    'h-[36px] md:h-[40px] rounded-[6px] flex items-center justify-center px-3 sm:px-4 text-[12px] sm:text-[13px] md:text-[14px] whitespace-nowrap transition-all duration-200'

const Btns = ({
    services = [],
    initialService = 'Vehicle Rental',
    initialMode = 'Land',
    onServiceChange,
    onModeChange,
}) => {
    // Get available service names from the services prop
    const availableServices = services.map(service => service.category_name)
    
    // Set initial service to first available service or fallback
    const firstAvailableService = availableServices.length > 0 ? availableServices[0] : initialService
    const [activeService, setActiveService] = useState(firstAvailableService)
    const [activeMode, setActiveMode] = useState(initialMode)
    const shouldShowModeOptions = servicesWithModeOptions.includes(activeService)

    const handleServiceChange = (service) => {
        setActiveService(service)
        onServiceChange?.(service)
    }

    const handleModeChange = (mode) => {
        setActiveMode(mode)
        onModeChange?.(mode)
    }

    return (
        <div className='w-full flex flex-col items-center gap-5 sm:gap-8 px-4 sm:px-6 xl:px-10 py-4'>
            {/* Always show service tabs */}
            {availableServices.length > 0 && (
                <div className='flex justify-center flex-wrap w-full max-w-[980px] bg-[#F3F3F3] rounded-[8px] p-[4px] sm:p-[6px] gap-2 sm:gap-3'>
                    {availableServices.map((service) => {
                        const isActive = activeService === service

                        return (
                            <button
                                key={service}
                                type='button'
                                onClick={() => handleServiceChange(service)}
                                className={`${baseButtonClass} flex-1 min-w-[125px] sm:min-w-[150px] md:min-w-[160px] ${
                                    isActive
                                        ? 'bg-[#0955AC] text-white font-bold opacity-100'
                                        : 'bg-white text-[#0955AC] font-medium opacity-45 hover:opacity-70 cursor-pointer'
                                }`}
                            >
                                {service}
                            </button>
                        )
                    })}
                </div>
            )}

            {shouldShowModeOptions && activeService === 'Vehicle Rental' ? (
                <div className='w-full max-w-[560px] bg-[#F3F3F3] rounded-[8px] p-[4px] sm:p-[6px] flex flex-wrap gap-2 sm:gap-3'>
                    {modeOptions.map((mode) => {
                        const isActive = activeMode === mode

                        return (
                            <button
                                key={mode}
                                type='button'
                                onClick={() => handleModeChange(mode)}
                                className={`${baseButtonClass} flex-1 min-w-[90px] ${
                                    isActive
                                        ? 'bg-[#0955AC] text-white font-bold opacity-100'
                                        : 'bg-white text-[#0955AC] font-medium opacity-45 hover:opacity-70'
                                }`}
                            >
                                {mode}
                            </button>
                        )
                    })}
                </div>
            ) : null}
        </div>
    )
}

export default Btns
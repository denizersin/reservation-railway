import Image from 'next/image';
import React from 'react'
import { IconTimer } from '../../svgs';
import FrontLanguageDropDown from './front-language-drop-down';
export default function HeadBanner({
    showHoldingSection
}: {
    showHoldingSection?: boolean
}) {
    return (
        <div>

            <div className='max-w-[1700px] h-[179px] md:h-[305px] overflow-hidden relative'>
                <div className='absolute left-0 top-0 w-full h-full ' >

                    <Image
                        src="/tt-back.png" // Path relative to the public directory
                        alt="Description of the image"
                        width={1264} // Specify the width
                        height={904} // Specify the height
                        className='w-full object-fill absolute left-0 top-0 translate-y-0 md:top-1/2 md:-translate-y-1/2 '
                    />
                    <div className="absolute left-0 top-0 w-full h-full bg-black/30 z-10" />
                </div>

                <Image
                    src="/logo.png"
                    alt="Description of the image"
                    width={180}
                    height={54}
                    className='absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20'
                />

                {
                    showHoldingSection && (
                        <div className="absolute bottom-0 h-max w-full py-3 z-10 bg-front-primary  flex items-center justify-center" >
                            <IconTimer className='size-5 mr-2' />
                            <div className="text-white text-sm ">We're holding this table for 10:00 minutes</div>
                        </div>
                    )
                }

            </div>
            <div className='max-w-screen-xl mx-auto flex justify-end mt-3 md:mt-5 mb-3'>
                <FrontLanguageDropDown />
            </div>
        </div>

    )
}
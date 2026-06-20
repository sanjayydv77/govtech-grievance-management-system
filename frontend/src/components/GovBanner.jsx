import React from 'react';

const GovBanner = () => {
    const changeFontSize = (step) => {
        const html = document.documentElement;
        let currentSize = parseFloat(window.getComputedStyle(html).fontSize);
        if (step === 0) {
            html.style.fontSize = ''; // Reset to default
        } else {
            const newSize = currentSize + step;
            if (newSize >= 12 && newSize <= 22) {
                html.style.fontSize = `${newSize}px`;
            }
        }
    };

    const skipToMain = () => {
        const main = document.querySelector('main') || document.body;
        main.tabIndex = -1;
        main.focus();
        main.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="w-full bg-white flex flex-col font-sans shrink-0">
            {/* Top thin official bar */}
            <div className="bg-blue-900 text-white px-4 py-1.5 flex justify-between items-center text-xs font-medium">
                <div className="flex gap-4">
                    <span>राष्ट्रीय राजधानी क्षेत्र दिल्ली सरकार / GOVT. OF NCT OF DELHI</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={skipToMain} className="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded px-1">Skip to main content</button>
                    <button onClick={() => changeFontSize(-1)} className="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded px-1" title="Decrease Font Size">A-</button>
                    <button onClick={() => changeFontSize(0)} className="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded px-1" title="Normal Font Size">A</button>
                    <button onClick={() => changeFontSize(1)} className="hover:underline focus:outline-none focus:ring-2 focus:ring-white rounded px-1" title="Increase Font Size">A+</button>
                    <div id="google_translate_element" className="inline-block transform translate-y-1 ml-2"></div>
                </div>
            </div>

            {/* Main Banner Content */}
            <div className="px-4 sm:px-8 py-3 flex items-center justify-between border-b-4 border-blue-800 shadow-sm bg-white z-50">
                
                {/* Left: PM, Emblem & Portal Title */}
                <div className="flex items-center gap-4 sm:gap-6">
                    {/* PM Photo */}
                    <div className="flex items-center gap-3">
                        <img 
                            src="/pm_modi.png" 
                            alt="Shri Narendra Modi, Prime Minister of India" 
                            className="h-28 w-24 object-cover shadow-sm border border-slate-200 rounded-sm"
                        />
                        <div className="hidden sm:flex flex-col justify-center">
                            <p className="text-xs font-bold text-blue-900 mb-0.5">श्री नरेन्द्र मोदी</p>
                            <p className="text-[10px] text-slate-600 font-semibold uppercase">माननीय प्रधान मंत्री</p>
                            <p className="text-xs font-bold text-blue-900 mt-1">Shri Narendra Modi</p>
                            <p className="text-[10px] text-slate-600 font-semibold uppercase">Hon'ble Prime Minister</p>
                        </div>
                    </div>

                    <div className="h-24 w-px bg-slate-300 mx-2 hidden lg:block"></div>

                    {/* Emblem & Title */}
                    <div className="flex items-center gap-4">
                        <img 
                            src="/emblem.svg" 
                            alt="National Emblem" 
                            className="h-28 w-auto drop-shadow-sm"
                        />
                        <div className="hidden xl:block">
                            <h1 className="text-3xl font-black text-blue-900 tracking-tight leading-none mb-1">CM Grievance Portal</h1>
                            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Govt. of NCT of Delhi</h2>
                            <div className="h-1 w-16 bg-amber-500 mt-2 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Right: CM Image (Larger & More Prominent) */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="hidden sm:flex flex-col justify-center text-right">
                        <p className="text-sm font-bold text-blue-900 mb-0.5">श्रीमती रेखा गुप्ता</p>
                        <p className="text-xs text-slate-600 font-semibold uppercase">माननीय मुख्यमंत्री, दिल्ली</p>
                        <p className="text-sm font-bold text-blue-900 mt-1">Smt. Rekha Gupta</p>
                        <p className="text-xs text-slate-600 font-semibold uppercase">Hon'ble Chief Minister, Delhi</p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-900 rounded-lg transform translate-x-1 translate-y-1 opacity-20"></div>
                        <img 
                            src="/cm_rekha_gupta.png" 
                            alt="Smt. Rekha Gupta, Chief Minister of Delhi" 
                            className="relative h-32 w-28 object-cover object-top shadow-md border-2 border-slate-200 rounded-lg bg-slate-50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GovBanner;

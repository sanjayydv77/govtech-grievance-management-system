import React from 'react';

const GovBanner = () => {
    return (
        <div className="w-full bg-white flex flex-col font-sans shrink-0">
            {/* Top thin official bar */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white px-4 py-1.5 flex justify-between items-center text-xs font-medium">
                <div className="flex gap-4">
                    <span>भारत सरकार / GOVERNMENT OF INDIA</span>
                    <span className="hidden sm:inline">|</span>
                    <span className="hidden sm:inline">राष्ट्रीय राजधानी क्षेत्र दिल्ली सरकार / GOVT. OF NCT OF DELHI</span>
                </div>
                <div className="flex gap-3">
                    <button className="hover:underline">Skip to main content</button>
                    <button className="hover:underline">A-</button>
                    <button className="hover:underline">A</button>
                    <button className="hover:underline">A+</button>
                    <button className="hover:underline">हिन्दी</button>
                </div>
            </div>

            {/* Main Banner Content */}
            <div className="px-4 sm:px-8 py-3 flex items-center justify-between border-b-4 border-purple-800 shadow-sm bg-white z-50">
                
                {/* Left: PM Image & Emblem */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <img 
                        src="/pm_modi.png" 
                        alt="Shri Narendra Modi, Prime Minister of India" 
                        className="h-24 w-20 object-cover shadow-sm border border-slate-200 rounded-sm"
                    />
                    <div className="hidden sm:flex flex-col justify-center">
                        <p className="text-xs font-bold text-blue-900 mb-0.5">श्री नरेन्द्र मोदी</p>
                        <p className="text-[10px] text-slate-600 font-semibold uppercase">माननीय प्रधान मंत्री</p>
                        <p className="text-xs font-bold text-blue-900 mt-1">Shri Narendra Modi</p>
                        <p className="text-[10px] text-slate-600 font-semibold uppercase">Hon'ble Prime Minister</p>
                    </div>

                    <div className="h-20 w-px bg-slate-300 mx-2 hidden lg:block"></div>

                    <div className="flex items-center gap-4">
                        <img 
                            src="/emblem.svg" 
                            alt="National Emblem" 
                            className="h-20 w-auto"
                        />
                        <div className="hidden md:block">
                            <h1 className="text-2xl font-black text-blue-900 tracking-tight leading-none mb-1">CM Grievance Portal</h1>
                            <h2 className="text-sm font-bold text-purple-700 uppercase tracking-widest">Govt. of NCT of Delhi</h2>
                        </div>
                    </div>
                </div>

                {/* Right: CM Image */}
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="hidden sm:flex flex-col justify-center text-right">
                        <p className="text-xs font-bold text-blue-900 mb-0.5">श्रीमती रेखा गुप्ता</p>
                        <p className="text-[10px] text-slate-600 font-semibold uppercase">माननीय मुख्यमंत्री, दिल्ली</p>
                        <p className="text-xs font-bold text-blue-900 mt-1">Smt. Rekha Gupta</p>
                        <p className="text-[10px] text-slate-600 font-semibold uppercase">Hon'ble Chief Minister, Delhi</p>
                    </div>
                    <img 
                        src="/cm_rekha_gupta.png" 
                        alt="Smt. Rekha Gupta, Chief Minister of Delhi" 
                        className="h-24 w-20 object-cover shadow-sm border border-slate-200 rounded-sm bg-slate-100"
                    />
                </div>
            </div>
        </div>
    );
};

export default GovBanner;

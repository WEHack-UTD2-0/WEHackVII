import React from 'react';

// --- VASE ASSET PATHS (absolute to avoid 404s on nested routes) ---
// Include both webp and png so older browsers that lack webp support still render.

const VASE_A2 = {
    webp: '/img/static/images/sponsor_vases/A2-trimmed.webp',
    png: '/img/static/images/sponsor_vases/A2-trimmed.png'
};
const VASE_A3 = {
    webp: '/img/static/images/sponsor_vases/A3-trimmed.webp',
    png: '/img/static/images/sponsor_vases/A3-trimmed.png'
};
const VASE_A4 = {
    webp: '/img/static/images/sponsor_vases/A4-trimmed.webp',
    png: '/img/static/images/sponsor_vases/A4-trimmed.png'
};
const VASE_A5 = {
    webp: '/img/static/images/sponsor_vases/A5-trimmed.webp',
    png: '/img/static/images/sponsor_vases/A5-trimmed.png'
};
const VASE_A6 = {
    webp: '/img/static/images/sponsor_vases/A6-trimmed.webp',
    png: '/img/static/images/sponsor_vases/A6-trimmed.png'
};
const VASE_A7 = {
    webp: '/img/static/images/sponsor_vases/A7-trimmed.webp',
    png: '/img/static/images/sponsor_vases/A7-trimmed.png'
};
const VASE_A8 = {
    webp: '/img/static/images/sponsor_vases/A8-trimmed.webp',
    png: '/img/static/images/sponsor_vases/A8-trimmed.png'
};

const LOGO_STATEFARM = {
    webp: '/img/static/images/sponsors/statefarm_bronze.webp',
    png: '/img/static/images/sponsors/statefarm_bronze.png'
};
const LOGO_CBRE = {
    webp: '/img/static/images/sponsors/cbre_gold.webp',
    png: '/img/static/images/sponsors/cbre_gold.png'
};
const LOGO_FIDELITY = {
    // Fidelity art is already PNG only.
    webp: '/img/static/images/sponsors/fidelity_logo_white.png',
    png: '/img/static/images/sponsors/fidelity_logo_white.png'
};
const LOGO_CAPITAL_ONE = {
    webp: '/img/static/images/sponsors/capital_one_silver.webp',
    png: '/img/static/images/sponsors/capital_one_silver.png'
};

// Define grid item structure
interface GridItem {
    id: number;
    type: 'vase' | 'box';
    imagePath: {
        webp: string;
        png: string;
    };
    vaseClass?: string;
}

// Row tier labels
const rowTitles: Record<number, string | null> = {
    1: "GOLD SPONSORS",
    2: "SILVER SPONSOR",
    3: "BRONZE SPONSORS",
    4: null
};

// --- GRID ITEMS ---
const dummySponsors: GridItem[] = [
    { id: 2, type: 'vase', imagePath: VASE_A5, vaseClass: 'vase-style-6' },
    { id: 4, type: 'box', imagePath: LOGO_CBRE },
    { id: 5, type: 'box', imagePath: LOGO_FIDELITY },
    { id: 3, type: 'box', imagePath: LOGO_STATEFARM },
    { id: 1, type: 'vase', imagePath: VASE_A7, vaseClass: 'vase-style-6' },

    { id: 6, type: 'vase', imagePath: VASE_A6, vaseClass: 'vase-style-6' },
    { id: 10, type: 'vase', imagePath: VASE_A2, vaseClass: 'vase-style-6' },
    { id: 9, type: 'box', imagePath: LOGO_CAPITAL_ONE },
    { id: 7, type: 'vase', imagePath: VASE_A3, vaseClass: 'vase-style-6' },
    { id: 8, type: 'vase', imagePath: VASE_A8, vaseClass: 'vase-style-6' },
];

// Size rules
const getBoxSizeClass = (id: number, type: 'vase' | 'box'): string => {
    const row = Math.ceil(id / 5);

    if (type === 'box') {
        switch (row) {
            case 1:
                return 'h-64 md:h-72 lg:h-64 w-72';

            case 2:
                return 'h-48 md:h-56 lg:h-64 w-72';

            default:
                return 'h-20';
        }
    }

    if (type === 'vase') {
        switch (row) {
            case 1: return 'h-48 md:h-64 lg:h-80';
            case 2: return 'h-44 md:h-60 lg:h-72';
            default: return 'h-48 md:h-64';
        }
    }

    return '';
};

// Group items into rows
const groupedSponsors = dummySponsors.reduce((acc, item) => {
    const row = Math.ceil(item.id / 5);
    if (!acc[row]) acc[row] = [];
    acc[row].push(item);
    return acc;
}, {} as Record<number, GridItem[]>);

const Sponsor: React.FC = () => {
    return (
        <div className='Sponsor-container w-full h-auto flex flex-col items-center p-6 py-20' id="Sponsor">

            {/* <div className="header-3">
                <h1>2026 Sponsors</h1>
            </div> */}

            {/* Grid & Row Rendering */}
            {/* <div className='Sponsor-grid-wrapper w-full max-w-7xl mx-auto flex flex-col gap-6 md:gap-16 lg:gap-20'>

                {Object.keys(groupedSponsors).map((rowKey) => {
                    const rowId = parseInt(rowKey);
                    const rowItems = groupedSponsors[rowId];

                    return (
                        <React.Fragment key={rowId}>

                            {rowTitles[rowId] && (
                                <div className="Sponsor-title-wrapper w-full text-center mb-6">
                                    <h1 className='Sponsor-title text-3xl md:text-4xl tracking-widest'>
                                        {rowTitles[rowId]}
                                    </h1>
                                </div>
                            )}

                            <div className='Sponsor-row grid grid-cols-5 gap-5 md:gap-10 lg:gap-12 w-full'>
                                {rowItems.map((item) => {

                                    const row = Math.ceil(item.id / 5);
                                    const sizeClass = getBoxSizeClass(item.id, item.type);

                                    const commonClasses = `
                                        relative
                                        w-full
                                        flex items-center justify-center
                                        transition-all duration-300 ease-in-out
                                        ${item.type === 'box' ? 'sponsor-box rounded-lg' : ''}
                                        ${sizeClass}
                                        ${item.type === 'box' && row === 2 ? 'sponsor-row-2-box' : ''}
                                        ${item.type === 'box' && row === 3 ? 'sponsor-row-3-box' : ''}
                                    `;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`Sponsor-placeholder ${item.type === 'vase' ? 'has-vase' : ''} ${commonClasses}`}
                                        >

                                            {item.type === 'vase' ? (
                                                <picture className={`Vase-item ${item.vaseClass}`}>
                                                    <source srcSet={item.imagePath.webp} type="image/webp" />
                                                    <source srcSet={item.imagePath.png} type="image/png" />
                                                    <img
                                                        src={item.imagePath.png}
                                                        alt={`Sponsor vase ${item.id}`}
                                                        className='w-full h-full object-contain'
                                                    />
                                                </picture>
                                            ) : (
                                                <div className="Box-content w-full h-full p-4 flex items-center justify-center">
                                                    <picture>
                                                        <source srcSet={item.imagePath.webp} type="image/webp" />
                                                        <source srcSet={item.imagePath.png} type="image/png" />
                                                        <img
                                                            src={item.imagePath.png}
                                                            alt={`Sponsor ${item.id}`}
                                                            className='max-w-[90%] max-h-[80%] object-contain opacity-70 transition-opacity duration-300'
                                                        />
                                                    </picture>
                                                </div>
                                            )}

                                        </div>
                                    );
                                })}
                            </div> 

                        </React.Fragment>
                    );
                })}

            </div> */}
     
            {/* Contact Info */}
            <div className="sponsor-text-container flex flex-col gap-y-5 flex-wrap items-center justify-center mt-20 font-gantari">
                <p className='sponsor-text text-[#CCBA97] font-medium text-4xl md:text-5xl'>
                    2027 Sponsors Coming Soon
                </p>
                <p className='sponsor-text text-[#CCBA97] font-medium text-2xl md:text-3xl text-center'>
                    Interested in sponsoring WEHack 2027? Contact us at wehackutd@gmail.com!
                </p>
            </div>

        </div>
    );
};

export default Sponsor;
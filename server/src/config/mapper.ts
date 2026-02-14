export const mapToVehicle = (row: any) => ({
    id: row.id,
    make: row.make,
    model: row.model,
    version: row.version,
    yearModel: row.year_model,
    mileage: row.mileage,
    price: row.price,
    oldPrice: row.old_price,
    fipePrice: row.fipe_price,
    isArmored: row.is_armored,
    images: row.images || (row.image ? [row.image] : []),
    location: row.location,
    status: row.status,
    color: row.color,
    fuel: row.fuel,
    transmission: row.transmission,
    plate: row.plate,
    options: row.options || [],
    description: row.description,
    owner: row.owner_name ? {
        name: row.owner_name,
        phone: row.owner_phone,
        email: row.owner_email
    } : undefined,
    // Campos de Procedência
    belowFipe: row.below_fipe,
    originType: row.origin_type,
    originCountry: row.origin_country,
    firstOwner: row.first_owner,
    fromAuction: row.from_auction,
    auctionDetails: row.auction_details,
    accidentHistory: row.accident_history,
    accidentDetails: row.accident_details,
    documentationStatus: row.documentation_status,
    documentationNotes: row.documentation_notes,
    ipvaPaid: row.ipva_paid,
    ipvaYear: row.ipva_year,
    warranty: row.warranty,
    warrantyDetails: row.warranty_details,
    // Campos de Estado/Manutenção
    tires: row.tires,
    keys: row.keys,
    engine: row.engine_state, // Using engine_state to avoid conflict if engine keyword exists, or just to be clear. User just said 'engine'. Let's map to 'engine_state' in DB maybe? Or just 'engine'. Let's stick to user request 'MOTOR' -> 'engine'.
    transmissionState: row.transmission_state,
    suspension: row.suspension,
    airConditioning: row.air_conditioning
});

export const mapToRow = (vehicle: any) => {
    const row: any = {
        make: vehicle.make,
        model: vehicle.model,
        version: vehicle.version,
        year_model: vehicle.yearModel,
        mileage: vehicle.mileage,
        price: vehicle.price,
        old_price: vehicle.oldPrice,
        fipe_price: vehicle.fipePrice,
        is_armored: vehicle.isArmored,
        images: vehicle.images,
        location: vehicle.location,
        status: vehicle.status,
        color: vehicle.color,
        fuel: vehicle.fuel,
        transmission: vehicle.transmission,
        plate: vehicle.plate,
        options: vehicle.options,
        description: vehicle.description,
    };

    if (vehicle.owner) {
        row.owner_name = vehicle.owner.name;
        row.owner_phone = vehicle.owner.phone;
        row.owner_email = vehicle.owner.email;
    }

    // Campos de Procedência
    if (vehicle.belowFipe !== undefined) row.below_fipe = vehicle.belowFipe;
    if (vehicle.originType) row.origin_type = vehicle.originType;
    if (vehicle.originCountry) row.origin_country = vehicle.originCountry;
    if (vehicle.firstOwner !== undefined) row.first_owner = vehicle.firstOwner;
    if (vehicle.fromAuction !== undefined) row.from_auction = vehicle.fromAuction;
    if (vehicle.auctionDetails) row.auction_details = vehicle.auctionDetails;
    if (vehicle.accidentHistory !== undefined) row.accident_history = vehicle.accidentHistory;
    if (vehicle.accidentDetails) row.accident_details = vehicle.accidentDetails;
    if (vehicle.documentationStatus) row.documentation_status = vehicle.documentationStatus;
    if (vehicle.documentationNotes) row.documentation_notes = vehicle.documentationNotes;
    if (vehicle.ipvaPaid !== undefined) row.ipva_paid = vehicle.ipvaPaid;
    if (vehicle.ipvaYear) row.ipva_year = vehicle.ipvaYear;
    if (vehicle.warranty !== undefined) row.warranty = vehicle.warranty;
    if (vehicle.warrantyDetails) row.warranty_details = vehicle.warrantyDetails;

    // Campos de Estado/Manutenção
    if (vehicle.tires) row.tires = vehicle.tires;
    if (vehicle.keys) row.keys = vehicle.keys;
    if (vehicle.engine) row.engine_state = vehicle.engine; // Mapping 'engine' prop to 'engine_state' column to allow 'engine' text
    if (vehicle.transmissionState) row.transmission_state = vehicle.transmissionState;
    if (vehicle.suspension) row.suspension = vehicle.suspension;
    if (vehicle.airConditioning) row.air_conditioning = vehicle.airConditioning;

    // Remove undefined keys
    Object.keys(row).forEach(key => row[key] === undefined && delete row[key]);

    return row;
};

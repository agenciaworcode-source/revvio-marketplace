export const mapToVehicle = (row: any) => ({
    id: row.id,
    make: row.make,
    model: row.model,
    version: row.version,
    yearModel: row.year_model,
    mileage: row.mileage,
    price: row.price,
    oldPrice: row.old_price,
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
    } : undefined
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

    // Remove undefined keys
    Object.keys(row).forEach(key => row[key] === undefined && delete row[key]);

    return row;
};

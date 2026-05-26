def get_vehicle_type_from_plate(
    plate_box,
    vehicles,
):

    px1, py1, px2, py2 = plate_box

    for vehicle in vehicles:

        vx1, vy1, vx2, vy2 = (
            vehicle["box"]
        )

        # check plate inside vehicle
        if (
            px1 >= vx1
            and py1 >= vy1
            and px2 <= vx2
            and py2 <= vy2
        ):

            return vehicle["label"]

    return "unknown"
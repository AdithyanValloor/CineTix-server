import { Theater } from "../models/theatersModel.js";
import { ShowSeatStatus } from "../models/showSeatStatusModel.js";

export const generateShowSeatStatuses = async (showId, theaterId) => {
    const theater = await Theater.findById(theaterId);
    if (!theater) throw new Error("Theater not found");

    const { rows, columns, sections } = theater;
    const seatStatuses = [];

    for (let rowNum = 0; rowNum < rows; rowNum++) {
        const rowLetter = String.fromCharCode(65 + rowNum); // A, B, C...

        const section = sections.find(sec =>
            sec.rows.includes(rowLetter)
        );
        if (!section) continue;

        for (let col = 1; col <= columns; col++) {
            seatStatuses.push({
                show: showId,
                seat: `${rowLetter}${col}`,
                sectionName: section.sectionName,
                seatType: section.seatType,
                price: section.price,
                isBooked: false,
                isReserved: false,
                bookedBy: null,
                reservationExpiry: null,
                rows,
                columns
            });
        }
    }

    await ShowSeatStatus.insertMany(seatStatuses);
    console.log(`Generated ${seatStatuses.length} seats for show ${showId}`);
};


import sequelize from "../config/database";
import CreateOffDay from "../dto/RequestDto/CreateOffDay";
import UpdateOffDay from "../dto/RequestDto/updateOffDay";
import { OffDay, Staff } from "../model";


const toOffDayDto = (offDay: OffDay)=> ({
    id: offDay.id,
    staffId: offDay.staffId,
    startDate: offDay.startDate,
    endDate: offDay.endDate,
    staffName: offDay.staff?.name
});

const createOffDayByStaffIds = async (offday: CreateOffDay) => {
    const transaction = await sequelize.transaction();
    let offDayList: OffDay[] = [];

    try {
        for (const staffId of offday.staffIds) {
            const offDay = await OffDay.create({
                staffId: staffId,
                startDate: offday.startDate,
                endDate: offday.endDate,
            }, { transaction });

            offDayList.push(offDay);
        }

        await transaction.commit();
        return offDayList;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const getAllOffDayByCompanyId = async (companyId: number) => {
    try {
        const offDays = await OffDay.findAll({
            include: [{
                model: Staff,
                where: { company_id: companyId },
                attributes: ["name"]
            },]
        });
        return offDays.map(toOffDayDto);
    } catch (error) {
        throw error;
    }
};

const getOffDayByStaffId = async (staffId: number) => {
    try {
        const offDays = await OffDay.findAll({
            where: { staffId: staffId },
            include: [Staff]
        });
        return offDays;
    } catch (error) {
        throw error;
    }
};

const getOffDayById = async (id: number) => {
    try {
        const offDay = await OffDay.findByPk(id);
        return offDay;
    } catch (error) {
        throw error;
    }
};

const updateOffDayById = async (updateOffDay: UpdateOffDay) => {
    try {
        const offDay = await getOffDayById(updateOffDay.id);
        if (!offDay) {
            return null;
        }

        await offDay.update({
            startDate: updateOffDay.startDate,
            endDate: updateOffDay.endDate,
        });

        return offDay;
    } catch (error) {
        throw error;
    }
};

const deleteOffDayById = async (id: number) => {
    try {
        const offDay = await getOffDayById(id);
        if (!offDay) {
            return null;
        }

        await offDay.destroy();
        return true;
    } catch (error) {
        throw error;
    }
};

export {
    createOffDayByStaffIds,
    getAllOffDayByCompanyId,
    getOffDayByStaffId,
    getOffDayById,
    updateOffDayById,
    deleteOffDayById,
};

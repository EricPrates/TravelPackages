export default function PackageDetailsController() {

     const verifyType = (item) => {
            if (item.type === 'FLIGHT') {
                return '✈️ Voo';
            } else if (item.type === 'HOTEL') {
                return '🏨 Hotel';
            } else if (item.type === 'CAR_RENTAL') {
                return '🚗 Aluguel de Carro';
            } else if (item.type === 'ACTIVITY') {
                return '🎯 Atividade';
            }
            return item.type;
        };
    
        const getStatusColor = (status) => {
            switch (status?.toUpperCase()) {
                case 'AVAILABLE':
                    return '#10B981';
                case 'CONFIRMED':
                    return '#3B82F6';
                case 'CANCELLED':
                    return '#EF4444';
                case 'PENDING':
                    return '#F59E0B';
                default:
                    return '#6B7280';
            }
        };
    
        const getTypeColor = (type) => {
            switch (type) {
                case 'FLIGHT':
                    return '#3B82F6';
                case 'HOTEL':
                    return '#8B5CF6';
                case 'CAR_RENTAL':
                    return '#F59E0B';
                case 'ACTIVITY':
                    return '#10B981';
                default:
                    return '#6B7280';
            }
        };
        return {
            verifyType,
            getStatusColor,
            getTypeColor,
        };
}
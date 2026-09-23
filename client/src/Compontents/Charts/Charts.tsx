import { EChartsReact } from 'react-echarts-library';
import type { EChartsOption } from 'echarts';
import type { Pool } from '../AdminPools/AdminPools';

interface ChartsProps {
    pools: Pool[]
}

export function Charts({ pools }: ChartsProps) {

    const overTheMonths: EChartsOption = {
        title: {
            text: "Monthly breakdown"
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        },
        yAxis: {
            type: "value"
        },
        series: [{
            name: "Coffee drank",
            type: "bar",
            data: [150, 123, 123, 63, 735, 123, 875, 123, 975, 356, 237, 125]
        },{
            name: "Money spent",
            type: "bar",
            data: [150, 123, 123, 63, 735, 123, 875, 123, 975, 356, 237, 125]
        }]
    }

    return (
        <div>
            <EChartsReact
                option={overTheMonths}
                style={{ height: 400, width: '100%' }}
            />
            <div>

            </div>
        </div>
    );
}
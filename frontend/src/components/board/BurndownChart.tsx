import { Component, For, createMemo } from 'solid-js';

interface BurndownData {
    date: string;
    ideal: number;
    actual: number;
}

interface BurndownChartProps {
    sprintName: string;
    startDate: string;
    endDate: string;
    totalPoints: number;
    completedPointsByDay: { date: string; completed: number }[];
}

export const BurndownChart: Component<BurndownChartProps> = (props) => {
    const chartData = createMemo(() => {
        const start = new Date(props.startDate);
        const end = new Date(props.endDate);
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const pointsPerDay = props.totalPoints / totalDays;

        const data: BurndownData[] = [];
        let remainingPoints = props.totalPoints;

        for (let i = 0; i <= totalDays; i++) {
            const currentDate = new Date(start);
            currentDate.setDate(currentDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];

            const completedToday = props.completedPointsByDay.find(d => d.date === dateStr)?.completed || 0;
            remainingPoints -= completedToday;

            data.push({
                date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                ideal: Math.max(0, props.totalPoints - (pointsPerDay * i)),
                actual: Math.max(0, remainingPoints),
            });
        }

        return data;
    });

    const maxValue = createMemo(() => props.totalPoints);
    const chartHeight = 200;
    const chartWidth = 600;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    const getX = (index: number) => (index / (chartData().length - 1)) * innerWidth + padding.left;
    const getY = (value: number) => innerHeight - (value / maxValue()) * innerHeight + padding.top;

    const idealLine = createMemo(() => {
        return chartData()
            .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.ideal)}`)
            .join(' ');
    });

    const actualLine = createMemo(() => {
        return chartData()
            .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.actual)}`)
            .join(' ');
    });

    return (
        <div class="card p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="font-semibold text-surface-900 dark:text-white">Burndown Chart</h3>
                    <p class="text-sm text-surface-500">{props.sprintName}</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-surface-300 rounded-full" />
                        <span class="text-sm text-surface-500">Ideal</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-3 h-3 bg-primary-500 rounded-full" />
                        <span class="text-sm text-surface-500">Actual</span>
                    </div>
                </div>
            </div>

            <div class="overflow-x-auto">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} class="w-full min-w-[400px]">
                    {/* Grid lines */}
                    <For each={[0, 25, 50, 75, 100]}>
                        {(percent) => (
                            <>
                                <line
                                    x1={padding.left}
                                    y1={getY((percent / 100) * maxValue())}
                                    x2={chartWidth - padding.right}
                                    y2={getY((percent / 100) * maxValue())}
                                    stroke="currentColor"
                                    class="text-surface-100 dark:text-surface-700"
                                    stroke-dasharray="4"
                                />
                                <text
                                    x={padding.left - 10}
                                    y={getY((percent / 100) * maxValue()) + 4}
                                    text-anchor="end"
                                    class="text-xs fill-surface-400"
                                >
                                    {Math.round((percent / 100) * maxValue())}
                                </text>
                            </>
                        )}
                    </For>

                    {/* Ideal burndown line */}
                    <path
                        d={idealLine()}
                        fill="none"
                        stroke="currentColor"
                        class="text-surface-300 dark:text-surface-600"
                        stroke-width="2"
                        stroke-dasharray="6"
                    />

                    {/* Actual burndown line */}
                    <path
                        d={actualLine()}
                        fill="none"
                        stroke="currentColor"
                        class="text-primary-500"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />

                    {/* Data points */}
                    <For each={chartData()}>
                        {(d, i) => (
                            <g>
                                <circle
                                    cx={getX(i())}
                                    cy={getY(d.actual)}
                                    r="4"
                                    class="fill-primary-500"
                                />
                                <circle
                                    cx={getX(i())}
                                    cy={getY(d.actual)}
                                    r="8"
                                    class="fill-primary-500/20 hover:fill-primary-500/40 cursor-pointer"
                                />
                            </g>
                        )}
                    </For>

                    {/* X-axis labels */}
                    <For each={chartData()}>
                        {(d, i) => (
                            <text
                                x={getX(i())}
                                y={chartHeight - 10}
                                text-anchor="middle"
                                class="text-xs fill-surface-400"
                            >
                                {i() % 2 === 0 ? d.date : ''}
                            </text>
                        )}
                    </For>

                    {/* Y-axis label */}
                    <text
                        x={15}
                        y={chartHeight / 2}
                        text-anchor="middle"
                        transform={`rotate(-90, 15, ${chartHeight / 2})`}
                        class="text-xs fill-surface-400"
                    >
                        Story Points
                    </text>
                </svg>
            </div>

            {/* Stats */}
            <div class="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-surface-100 dark:border-surface-700">
                <div class="text-center">
                    <p class="text-2xl font-bold text-surface-900 dark:text-white">{props.totalPoints}</p>
                    <p class="text-xs text-surface-500">Total Points</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl font-bold text-green-600">
                        {props.totalPoints - (chartData()[chartData().length - 1]?.actual || 0)}
                    </p>
                    <p class="text-xs text-surface-500">Completed</p>
                </div>
                <div class="text-center">
                    <p class="text-2xl font-bold text-primary-600">
                        {chartData()[chartData().length - 1]?.actual || 0}
                    </p>
                    <p class="text-xs text-surface-500">Remaining</p>
                </div>
            </div>
        </div>
    );
};

// Demo/example usage wrapper
export const BurndownChartDemo: Component = () => {
    const demoData = {
        sprintName: 'Sprint 1',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        totalPoints: 60,
        completedPointsByDay: [
            { date: '2024-01-01', completed: 5 },
            { date: '2024-01-02', completed: 8 },
            { date: '2024-01-03', completed: 3 },
            { date: '2024-01-04', completed: 6 },
            { date: '2024-01-05', completed: 10 },
            { date: '2024-01-08', completed: 7 },
            { date: '2024-01-09', completed: 5 },
            { date: '2024-01-10', completed: 8 },
        ],
    };

    return <BurndownChart {...demoData} />;
};

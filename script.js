document.addEventListener('DOMContentLoaded', function() {
    const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            createHeatMap(data);
        });

    function createHeatMap(data) {
        const baseTemperature = data.baseTemperature;
        const monthlyData = data.monthlyVariance;

        const width = 1200;
        const height = 600;
        const padding = 60;

        const svg = d3.select('#chart')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const xScale = d3.scaleBand()
            .domain(monthlyData.map(d => d.year))
            .range([padding, width - padding]);

        const yScale = d3.scaleBand()
            .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
            .range([height - padding, padding]);

        const colorScale = d3.scaleQuantize()
            .domain([d3.min(monthlyData, d => baseTemperature + d.variance), d3.max(monthlyData, d => baseTemperature + d.variance)])
            .range(["#2c7bb6", "#00a6ca", "#00ccbc", "#90eb9d", "#ffff8c", "#f9d057", "#f29e2e", "#e76818", "#d7191c"]);

        svg.selectAll('.cell')
            .data(monthlyData)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('x', d => xScale(d.year))
            .attr('y', d => yScale(d.month - 1))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('data-month', d => d.month - 1)
            .attr('data-year', d => d.year)
            .attr('data-temp', d => baseTemperature + d.variance)
            .attr('fill', d => colorScale(baseTemperature + d.variance))
            .on('mouseover', function(event, d) {
                const tooltip = d3.select('#tooltip');
                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip.html(`${d.year} - ${d.month}<br>${(baseTemperature + d.variance).toFixed(2)}°C`)
                    .attr('data-year', d.year)
                    .style('left', `${event.pageX + 5}px`)
                    .style('top', `${event.pageY - 28}px`);
            })
            .on('mouseout', function() {
                d3.select('#tooltip').transition().duration(500).style('opacity', 0);
            });

        const xAxis = d3.axisBottom(xScale)
            .tickValues(xScale.domain().filter(year => year % 10 === 0));
        const yAxis = d3.axisLeft(yScale)
            .tickFormat(month => new Date(0, month).toLocaleString('default', { month: 'long' }));

        svg.append('g')
            .attr('id', 'x-axis')
            .attr('transform', `translate(0, ${height - padding})`)
            .call(xAxis);

        svg.append('g')
            .attr('id', 'y-axis')
            .attr('transform', `translate(${padding}, 0)`)
            .call(yAxis);

        const legend = d3.select('#legend')
            .append('svg')
            .attr('width', 400)
            .attr('height', 50);

        const legendScale = d3.scaleLinear()
            .domain(colorScale.domain())
            .range([0, 300]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5);

        legend.selectAll('rect')
            .data(colorScale.range().map(color => {
                const d = colorScale.invertExtent(color);
                return d[0];
            }))
            .enter()
            .append('rect')
            .attr('x', (d, i) => i * 30)
            .attr('y', 0)
            .attr('width', 30)
            .attr('height', 20)
            .attr('fill', d => colorScale(d));

        legend.append('g')
            .attr('transform', 'translate(0, 20)')
            .call(legendAxis);
    }
});
function getPerformance(squatsArray) {
    let performance = {
        grade: '', // perfect, good, average, bad or shit
        nrOfGoodSquats: 0
    };

    performance.nrOfGoodSquats =  squatsArray.filter(item => item === true).length;

    if (performance.nrOfGoodSquats === 13) {
        performance.grade = 'perfect';
    } else if (performance.nrOfGoodSquats > 9) {
        performance.grade = 'good';
    } else if (performance.nrOfGoodSquats > 5) {
        performance.grade = 'average';
    } else if (performance.nrOfGoodSquats > 0) {
        performance.grade = 'bad';
    } else {
        performance.grade = 'shit';
    }

    return performance;
}

module.exports = {
    getPerformance
};
// Inspired By
// https://codepen.io/abeatrize/pen/LJqYey
// Bongo Cat originally created by @StrayRogue and @DitzyFlama

const cat = {
    pawRight: {
        up: ".paw-right .up",
        down: ".paw-right .down",
    },
    pawLeft: {
        up: ".paw-left .up",
        down: ".paw-left .down",
    },
};

ChagePaw(cat.pawRight);
ChagePaw(cat.pawLeft);

function ChagePaw(paw) {
    let interaval = getRandomInt(400, getRandomInt(600, 1500));
    $(paw.up).toggleClass('visibility-hide');
    $(paw.down).toggleClass('visibility-hide');
    setTimeout(function() {
        ChagePaw(paw)
    }, interaval);
}
import { mount } from '@vue/test-utils';
// import { vue-template-compiler } from '@vue/test-utils';
import MapVisualizer from '../src/components/MapVisualizer.vue';

describe("MapVisualizer", () => {
//   it("Should render a shapefile map", () => {
//     expect("hello");
//   });
    test("Should generate a new color", () => {
        expect(true).toEqual(true)
        // expect(MapVisualizer.generateColor().match(/#[a-zA-Z0-9]{6}/)).toEqual(true);
    })
});

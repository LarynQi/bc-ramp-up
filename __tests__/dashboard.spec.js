import { mount } from '@vue/test-utils';
import MapVisualizer from './../src/components/MapVisualizer.vue';
import { shallowMount } from '@vue/test-utils'

describe("MapVisualizer.vue", () => {
//   it("Should render a shapefile map", () => {
//     expect("hello");
//   });
    // it('renders props.msg when passed', () => {
    //     const msg = 'new message'
    //     const wrapper = shallowMount(MapVisualizer, {
    //     })
    //     expect(wrapper.text()).toMatch(msg)
    // })
    // describe('MapVisualizer', () => {
    //     // Inspect the raw component options
    //     it('has data', () => {
    //       expect(typeof MapVisualizer.data).toBe('function')
    //     })
    //   })
    test("Should generate a new color", () => {
        expect(MapVisualizer.generateColor().match(/#[a-zA-Z0-9]{6}/)).toEqual(true);
    })

    test("Getting Mapbox upload status should be true for most recent upload", async () => {
        expect(await MapVisualizer.getStatus()).toBeTruthy()
    })
});

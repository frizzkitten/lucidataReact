import React from 'React';
import parseSms from '../app/lib/parseSms';

it('Should choose wikipedia', () => {
    let input = "w,sfdff";
    let output = parseSms(input);
    expect(output).toEqual({api: "wikipedia", info: input.substring(2)});
});

it('Should choose weather', () => {
    let input = "f2/cloudy;45;snow;0.25/sunny;56/partly-cloud;46;rain;0.1";
    let output = parseSms(input);
    expect(output).toMatchObject({api: "weather"});
});

it('Should choose directions', () => {
    let input = "d(1.2 mi);description";
    let output = parseSms(input);
    expect(output).toMatchObject({api: "directions"});
});

it('Should choose sports', () => {
    let input = "sMil;Bos;p";
    let output = parseSms(input);
    expect(output).toEqual({api: "sports", data: input});
});
// it('', () => {
//     let input = "";
//     let output = parseSms(input);
//     expect(output)
// });
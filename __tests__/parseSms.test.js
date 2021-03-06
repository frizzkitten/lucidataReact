import React from 'React';
import parseSms from '../app/lib/parseSms';

it('Should fail and find none because we sent incorrect type', () => {
    let input = 5000;
    let output = parseSms(input);
    expect(output).toEqual({api: 'not found'});
});

it('Should fail and find none because we send garbage', () => {
    let input = "xyaa;lsfdl;jaf;lsjf;f;lsdfjasfdfdfdffdf43493434";
    let output = parseSms(input);
    expect(output).toEqual({api: 'not found'});
});

it('Should fail and find none because we send too small weather message', () => {
    let input = "f";
    let output = parseSms(input);
    expect(output).toEqual({api: 'not found'});
});

it('Should correctly remove the trial account message', () => {
    let input = "Sent from your Twilio trial account - sMil;Bos;p";
    let output = parseSms(input);
    expect(output).toEqual({api: "sports", data: "sMil;Bos;p"});
});

it('Should choose wikipedia', () => {
    let input = "wwords from wikipedia";
    let output = parseSms(input);
    expect(output).toEqual({api: "wikipedia", info: input.substring(1)});
});

it('Should choose 24 Hour weather', () => {
    let input = "f2cloudy;45;snow;0.25/sunny;56/partly-cloud;46;rain;0.1";
    let output = parseSms(input);
    expect(output).toMatchObject({api: "weather", weatherType: "24 Hour"});
});

it('Should choose 7 day weather', () => {
    let input = "f7cloudy;45;35;snow;0.25/sunny;59;45";
    let output = parseSms(input);
    expect(output).toMatchObject({api: "weather", weatherType: "7 Day"});
});

it('Should choose alert weather', () => {
    let input = "faalerting you//I'm alerting you again";
    let output = parseSms(input);
    expect(output).toMatchObject({api: "weather", weatherType: "Alerts"});
});

it('Should choose directions', () => {
    let input = "d(1.2 mi)description;(2.1 ft)other description";
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
import React from 'React';
import { parseSports, parseGame } from '../screens/sports';

/* *
 * parseSports Tests
 * */
it('parseSports: should return an empty list if data is empty string', () => {
    let output = parseSports("");
    expect(output).toEqual([]);
});

it('parseSports: should ignore extra separator and return 3 items', () => {
    let input = "sa/b/c/";
    let output = parseSports(input);
    expect(output).toHaveLength(3);
});

it('parseSports: should return 1 game each of finished, in progress, and pending', () => {
    let input = "sAil;Bos;f;10;15/Bil;Bos;p/Cil;Bos;7:30PM";
    let output = parseSports(input);
    expect(output).toEqual(
        [{away: "Ail", home: "Bos", status: "f", awayScore: "10", homeScore: "15"},
        {away: "Bil", home: "Bos", status: "p"},
        {away: "Cil", home: "Bos", status: "7:30PM"}]);
});

/* *
 * parseGame Tests
 * */
it('parseGame: should return empty json if too few elements', () => {
    let input = "a;b";
    let output = parseGame(input);
    expect(output).toEqual({});
});

it('parseGame: should return finished game correctly', () => {
    let input = "Mil;Bos;f;10;15";
    let output = parseGame(input);
    expect(output).toEqual({away: "Mil",
                            home: "Bos",
                            status: "f",
                            awayScore: "10",
                            homeScore: "15"});
});

it('parseGame: should return game that has no started yet correctly', () => {
    let input = "Mil;Bos;7:30PM";
    let output = parseGame(input);
    expect(output).toEqual({away: "Mil",
                            home: "Bos",
                            status: "7:30PM"});
});

it('parseGame: should return a game that is in progress correctly', () => {
    let input = "Mil;Bos;p";
    let output = parseGame(input);
    expect(output).toEqual({away: "Mil",
                            home: "Bos",
                            status: "p"});
});

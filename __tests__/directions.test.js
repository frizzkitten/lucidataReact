jest.mock('../app/lib/getLocation');
jest.mock('../app/lib/sendSms');
import * as directions from  '../screens/directions';


it('Uses both mocks as expected', () => {
    directions.getLocationAndSendText("Las Vegas");
})
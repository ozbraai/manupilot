import { POST as submitPOST } from '../submit/route';

export async function POST(request: Request) {
    return submitPOST(request);
}

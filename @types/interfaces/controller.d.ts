/** controller type */
export interface TController extends Function {
    new (): IController;
}

/** controller interface */
export interface IController {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
}

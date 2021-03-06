export declare class NetworkCookie {
    private readonly _name;
    private readonly _value;
    private _attributes;
    private _size;
    get size(): number;
    set size(size: number);
    get name(): string;
    get value(): string;
    get httpOnly(): boolean;
    get secure(): boolean;
    get sameSite(): 'Strict' | 'Lax' | 'None' | undefined;
    get session(): boolean | undefined;
    get path(): string | undefined;
    get port(): string | undefined;
    get domain(): string | undefined;
    get expires(): string;
    get maxAge(): number;
    get url(): string;
    constructor(name: string, value: string);
    expiresDate(requestDate: Date): Date | undefined;
    addAttribute(key: string, value: string): void;
}

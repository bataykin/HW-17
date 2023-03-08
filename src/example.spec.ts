function summarize(a:number, b:number): number {
    return a+b
};

let  a = summarize;


describe('example tests', ()=>{
    it('equals true', ()=>{
        expect(true).toBeTruthy()
        expect(0).toBeFalsy()
        expect(a(4, 6)).toBe(10)

    })
    it('equals false', ()=>{
        expect(0).toBeFalsy()
        expect(summarize(4, 6)).toBe(10)

    })
})


export const IRequestRepoToken = Symbol('IRequestRepoToken')

export interface IRequestRepo<GenericRequestType> {
    addRequest(ip: string, trueDate: Date, fullUrl: string)

    getAttempts(ip: string, attemptsInterval: number, trueDate: Date, url: string): Promise<number>
}
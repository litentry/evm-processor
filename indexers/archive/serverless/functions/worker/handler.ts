export default async (event) => {
    for (const record of event.Records) {
        console.log("Message Body: ", record.body);
    }
};
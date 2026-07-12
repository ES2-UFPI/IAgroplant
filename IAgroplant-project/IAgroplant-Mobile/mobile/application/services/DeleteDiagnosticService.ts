import { del } from "../../infrastructure/api/api";

export async function deleteDiagnostic(
    id: string,
): Promise<void> {

    await del(
        `/diagnostics/${id}/delete`
    );

}

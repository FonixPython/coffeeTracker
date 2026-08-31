import "./Admin.css"
import { SectionCard } from "../../Compontents/SectionCard/SectionCard"

export function AdminPage() {
    return (
        <main>
            <SectionCard title="Pools" collapseable>
                <button>Add Pool</button>
            </SectionCard>
            <SectionCard title="Variations" collapseable>
                <button>Add variation</button>
            </SectionCard>
            <SectionCard title="Users" collapseable>
                <button>Register User</button>
            </SectionCard>
        </main>
    )
}
import { useGetPokemonByNameQuery } from "../services/pokemon"
import { useState } from "react"

const pokemon = ['bulbasaur', 'pikachu', 'ditto', 'bulbasaur']

function Pokemon({ name, pollingInterval }) {

    const { data, error, isLoading, isFetching } = useGetPokemonByNameQuery(name, { pollingInterval })

    return (
        // Display the state of the response to the user
        <div>
            {error ? (
                <>Oh no, there was an error</>
            ) : isLoading ? (
                <>Loading...</>
            ) : data ? (
                <>
                    <h3>{data.species.name} {isFetching ? "..." : ""}</h3>
                    <img src={data.sprites.front_shiny} alt={data.species.name} />
                </>
            ) : null}
        </div>
    )
}

export default function PokemonDisplay() {
    // The pollingInterval determines how often we fetch the data. Right now, there isn't a reason to,
    // but in the future we might have to deal with data that is changing
    const [pollingInterval, setPollingInterval] = useState(0)

    return (
        <div>
            <select
                onChange={(change) => setPollingInterval(Number(change.target.value))}
            >
                <option value={0}>Off</option>
                <option value={1000}>1s</option>
                <option value={5000}>5s</option>
            </select>
            <div>
                {/* The nice thing about redux is that it can handle many different requests at the same time
                    and merges duplicate requests */}
                {pokemon.map((poke, index) => (
                    <Pokemon key={index} name={poke} pollingInterval={pollingInterval} />
                ))}
            </div>
        </div>
    )
}

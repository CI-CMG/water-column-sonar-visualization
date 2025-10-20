import { useGetPokemonByNameQuery } from "../services/pokemon"
import { useState } from "react"

const pokemon = ['bulbasaur', 'pikachu', 'ditto', 'bulbasaur']

function Pokemon({ name, pollingInterval }) {

    const { data, error, isLoading, isFetching } = useGetPokemonByNameQuery(name, { pollingInterval })

    return (
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
                {pokemon.map((poke, index) => (
                    <Pokemon key={index} name={poke} pollingInterval={pollingInterval} />
                ))}
            </div>
        </div>
    )
}

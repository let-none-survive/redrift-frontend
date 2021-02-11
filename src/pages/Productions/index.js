import React, { useCallback, useState, useContext } from 'react'
import { useQuery, useMutation } from 'react-query'
import { BASE_URL } from '../../../config/enviroment'
import Modal from '../../components/Modal'
import { ReactQueryContext } from '../../context/ReactQueryContext'
import axios from 'axios'

const Productions = () => {
  const { client } = useContext(ReactQueryContext)
  const [isLoading, setIsLoading] = useState(false)
  const [ isModalOpen, setIsModalOpen ] = useState(false)
  const [production, setProduction] = useState({
    name: '',
    amount: 0
  })

  const { data, error, isLoading: productionsLoaded, isError } = useQuery('productions', () => {
    return fetch(BASE_URL + '/productions').then(res => res.json())
  })

  const mutation = useMutation((data) => {
    return axios.post(BASE_URL + '/productions', data)
  }, {
    onMutate: () => {
      setIsLoading(true)
    },
    onError: () => {
      setIsLoading(false)
    },
    onSuccess: () => {
      // Invalidate and refetch
      setIsLoading(false)
      setIsModalOpen(false)
      return client.invalidateQueries('productions')
    }
  })

  const createProduction = useCallback(() => {
    console.log({ production })
    mutation.mutate(production)
  }, [production])

  const handleChange = useCallback((e) => {
    setProduction({
      ...production,
      [e.target.name]: e.target.value
    })
    console.log({production})
  }, [production])

  const toggleModal = useCallback(() => {
    setIsModalOpen(!isModalOpen)
  }, [ isModalOpen ])

  // todo vinesti table
  return (
    <section className="section">
      <div className="container">
        <div className="title has-text-centered">
          Productions
          <button onClick={toggleModal} className="button is-success ml-2">
            <span className="icon is-small">
              <i className="fas fa-plus" />
            </span>
          </button>
        </div>
        <table className="table is-full-width">
          <thead>
          <th><abbr title="Position">Pos</abbr></th>
          <th>Name</th>
          <th>Distributed amount</th>
          <th>Undistributed amount</th>
          <th>Total amount</th>
          <th/>
          </thead>
          <tfoot>
          <th><abbr title="Position">Pos</abbr></th>
          <th>Name</th>
          <th>Distributed amount</th>
          <th>Undistributed amount</th>
          <th>Total amount</th>
          <th />
          </tfoot>
          <tbody>
          {productionsLoaded ? (
            <span>Loading...</span>
          ) : (
            <>
              {data.map(production => {
                return (
                  <tr key={production.id}>
                    <td>{production.id}</td>
                    <td>{production.name}</td>
                    <td>{production.distributedAmount}</td>
                    <td>{production.unDistributedAmount}</td>
                    <td>{production.amount}</td>
                    <td className="is-actions-cell">
                      <div className="buttons is-right">
                        <button className="button is-small is-primary" type="button">
                          <span className="icon"><i className="fa fa-eye"/></span>
                        </button>
                        <button className="button is-small is-danger jb-modal" data-target="sample-modal" type="button">
                          <span className="icon"><i className="fa fa-trash"/></span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </>
          )}
          </tbody>
        </table>

        <Modal onSave={createProduction} onClose={toggleModal} isOpen={isModalOpen} isLoading={isLoading}>
          <form>
            <div className="columns">
              <div className="column is-8">
                <div className="field">
                  <label className="label">Name</label>
                  <div className="control">
                    <input name='name' onChange={handleChange} className="input" type="text" placeholder="Text input" />
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="field">
                  <label className="label">Amount</label>
                  <div className="control">
                    <input name='amount' onChange={handleChange} className="input" type="number" placeholder="Text input" />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </section>
  )
}

export default Productions

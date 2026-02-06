import Dad from './Dad'
import Uncle from './Uncle'
import Aunt from './Aunt'

export default function Grandpa() {
  return (
    <div>
      <h1>Grandpa</h1>
      <section className='flex'>
        <Dad></Dad>
        <Uncle></Uncle>
        <Aunt></Aunt>
      </section>
    </div>
  )
}

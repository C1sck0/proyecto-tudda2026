import useGlobal from '../services/useGlobal';

export default function Header({
  onClickMenu
}) {
  const { username } = useGlobal();

  return <header
    style={{
      backgroundColor: 'pink',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <img
      src="/menu.svg"
      alt="Menú"
      width={25}
      onClick={() => onClickMenu()}
    />
    <h1>Acá va el título de la página</h1>
    <div>
      {username && <div>Bienvenido: {username}</div>}
    </div>
  </header>;
}
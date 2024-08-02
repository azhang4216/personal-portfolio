export const ProjectCard = ({ title, description, imgUrl, link }) => {
  return (
    <div className="proj-imgbx">
      <a href={link} target="_blank" rel="noreferrer">
        <img src={imgUrl} alt="" />
        <div className="proj-txtx">
          <h4>{title}</h4>
          <span>{description}</span>
        </div>
      </a>
      
    </div>
  )
}

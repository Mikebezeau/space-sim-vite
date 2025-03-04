const isMouseOverStarInfoCard = (e: { clientX: number; clientY: number }) => {
  const starInfoCard = document.querySelector("#star-info-card");
  if (starInfoCard) {
    const rect = starInfoCard.getBoundingClientRect();
    return (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
  }
  return false;
};

export default isMouseOverStarInfoCard;

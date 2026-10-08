export const formStyles = `
  form {
    display: flex;
    flex-direction: column;
    gap: var(--app-space-2);
    max-width: var(--app-form-width);
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--app-space-2);
  }
  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0 var(--app-space-3);
  }
  @media (min-width: 480px) {
    .row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
`;

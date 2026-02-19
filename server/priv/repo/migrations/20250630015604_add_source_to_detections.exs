defmodule Orcasite.Repo.Migrations.AddSourceToDetections do
  use Ecto.Migration

  def up do
    alter table(:detections) do
      add :source, :text, null: false, default: "human"
    end
  end

  def down do
    alter table(:detections) do
      remove :source
    end
  end
end
